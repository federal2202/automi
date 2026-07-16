import asyncio
import json
import os
from dotenv import load_dotenv
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
import asyncpg

from ai_worker import generate_task, save_task, mark_failed

load_dotenv()

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "localhost:9092")
DATABASE_URL = os.getenv("DATABASE_URL")


async def main():
    # A connection POOL instead of one long-lived connection: cheap/serverless
    # Postgres (Supabase/Neon) drops idle connections, which used to kill the
    # single connection permanently (BUG-4). The pool reconnects transparently.
    pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=5)

    consumer = AIOKafkaConsumer(
        "task.created",
        bootstrap_servers=KAFKA_BROKER,
        group_id="ai-service",
        value_deserializer=lambda m: json.loads(m.decode("utf-8")),
        # Commit manually so a crash mid-processing doesn't silently drop the
        # message (default auto-commit committed even on failure).
        enable_auto_commit=False,
        auto_offset_reset="earliest",
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
            task_id = payload.get("taskId")
            print(f"Received: {payload}")

            if not task_id:
                # Nothing we can key a DB update on — skip rather than run an
                # UPDATE ... WHERE id = NULL that silently touches zero rows.
                print(f"Skipping message with no taskId: {payload}")
                await consumer.commit()
                continue

            try:
                task = await generate_task(payload["title"])
                async with pool.acquire() as db:
                    await save_task(db, task_id, task)
                print(f"Task enriched: {task_id}")
            except Exception as e:
                # Any failure marks the task 'failed' so the UI stops spinning
                # instead of showing a task stuck on 'pending' forever (BUG-3).
                print(f"Failed to process task {task_id}: {e}")
                try:
                    async with pool.acquire() as db:
                        await mark_failed(db, task_id)
                except Exception as inner:
                    print(f"Also failed to mark task failed: {inner}")
                await consumer.commit()
                continue

            # Notify separately from the generate+save step: if this publish
            # fails (e.g. a transient Kafka blip) the task is already correctly
            # saved as 'done' in the DB — the previous code re-used the same
            # except block and would wrongly flip a successful task back to
            # 'failed', discarding correct data over a notification hiccup.
            # Worst case here is a missed real-time push; the frontend still
            # picks it up on the next poll/reload.
            try:
                # Forward taskId + eventId so the backend consumer has a real id
                # to notify the client with (BUG-2).
                await producer.send("task.enriched", {
                    "taskId": task_id,
                    "eventId": payload.get("eventId"),
                    "userId": payload.get("userId"),
                })
            except Exception as e:
                print(f"Task {task_id} enriched but failed to publish notification: {e}")

            await consumer.commit()
    finally:
        await consumer.stop()
        await producer.stop()
        await pool.close()


if __name__ == "__main__":
    asyncio.run(main())
