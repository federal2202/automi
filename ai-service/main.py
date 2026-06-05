import asyncio
import json
import os
from dotenv import load_dotenv
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
import google.generativeai as genai
import asyncpg

load_dotenv()

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "localhost:9092")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-3-flash-preview")


async def generate_task(title: str) -> dict:
    prompt = f"""You are a productivity assistant. Given a calendar event title, generate a structured task breakdown in JSON.

Event title: "{title}"

Return ONLY valid JSON matching this exact shape (no markdown, no code fences):
{{
  "title": "string",
  "description": "string",
  "estimatedTimeMinutes": number,
  "difficulty": "easy" | "medium" | "hard",
  "steps": [
    {{
      "stepNumber": number,
      "title": "string",
      "instruction": "string"
    }}
  ],
  "resources": [
    {{
      "title": "string",
      "type": "article or video or tool or document",
      "url": "string - a real working URL"
    }}
  ],
  "successCriteria": "string"
}}"""

    response = model.generate_content(prompt)
    text = response.text.strip()
    return json.loads(text)


async def save_task(db: asyncpg.Connection, task_id: str, task: dict):
    await db.execute("""
        UPDATE tasks SET
            title = $2,
            description = $3,
            "estimatedTimeMinutes" = $4,
            difficulty = $5,
            steps = $6::jsonb,
            resources = $7::jsonb,
            "successCriteria" = $8,
            "aiStatus" = 'done',
            "updatedAt" = NOW()
        WHERE id = $1
    """,
        task_id,
        task["title"],
        task["description"],
        task["estimatedTimeMinutes"],
        task["difficulty"],
        json.dumps(task["steps"]),
        json.dumps(task.get("resources", [])),
        task["successCriteria"],
    )


async def main():
    db = await asyncpg.connect(DATABASE_URL)

    consumer = AIOKafkaConsumer(
        "task.created",
        bootstrap_servers=KAFKA_BROKER,
        group_id="ai-service",
        value_deserializer=lambda m: json.loads(m.decode("utf-8")),
    )

    producer = AIOKafkaProducer(
        bootstrap_servers=KAFKA_BROKER,
        value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    )

    await consumer.start()
    await producer.start()
    print("AI service started, listening to task.created...")

    try:
        async for message in consumer:
            payload = message.value
            print(f"Received: {payload}")

            try:
                task = await generate_task(payload["title"])
                await save_task(db, payload["taskId"], task)
                await producer.send("task.enriched", {
                    "taskId": payload["taskId"],
                    "userId": payload["userId"],
                })
                print(f"Task enriched: {payload['taskId']}")
            except Exception as e:
                print(f"Failed to process task: {e}")
    finally:
        await consumer.stop()
        await producer.stop()
        await db.close()


if __name__ == "__main__":
    asyncio.run(main())
