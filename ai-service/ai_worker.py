"""
Pure(ish) task-generation logic, split out of main.py so it can be imported
and unit-tested without triggering `asyncio.run(main())` — importing main.py
directly runs the whole Kafka consumer loop as a side effect of import.
"""

import asyncio
import json
import os
import re
from dotenv import load_dotenv
import google.generativeai as genai
import asyncpg

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)
# response_mime_type forces the model to return raw JSON instead of a markdown
# code block, drastically cutting json.loads failures (matches the TS service).
model = genai.GenerativeModel(
    "gemini-3-flash-preview",
    generation_config={"response_mime_type": "application/json"},
)

VALID_DIFFICULTY = {"easy", "medium", "hard"}


def _strip_code_fences(text: str) -> str:
    """Defensive: strip ```json ... ``` fences if the model adds them anyway."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
    return text.strip()


def validate_task(raw: dict) -> dict:
    """Validate the AI output and coerce types. Raises ValueError if invalid.

    Without this, a malformed response caused a KeyError deep in save_task and
    the task was left stuck on 'pending' forever (BUG-3). estimatedTimeMinutes
    is coerced to int because the DB column is Int and the model may return a
    float or a numeric string (BUG-10).
    """
    if not isinstance(raw, dict):
        raise ValueError("AI result is not an object")

    for field in ("title", "description", "successCriteria"):
        value = raw.get(field)
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"Invalid field: {field}")

    difficulty = raw.get("difficulty")
    if difficulty not in VALID_DIFFICULTY:
        raise ValueError(f"Invalid difficulty: {difficulty!r}")

    try:
        minutes = int(round(float(raw.get("estimatedTimeMinutes"))))
    except (TypeError, ValueError):
        raise ValueError("Invalid estimatedTimeMinutes")
    if minutes <= 0:
        raise ValueError("estimatedTimeMinutes must be positive")

    steps = raw.get("steps")
    if not isinstance(steps, list):
        raise ValueError("Invalid field: steps")

    resources = raw.get("resources")
    if not isinstance(resources, list):
        resources = []

    return {
        "title": raw["title"],
        "description": raw["description"],
        "estimatedTimeMinutes": minutes,
        "difficulty": difficulty,
        "steps": steps,
        "resources": resources,
        "successCriteria": raw["successCriteria"],
    }


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

    response = await asyncio.to_thread(model.generate_content, prompt)
    text = _strip_code_fences(response.text)
    parsed = json.loads(text)
    return validate_task(parsed)


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
        json.dumps(task["resources"]),
        task["successCriteria"],
    )


async def mark_failed(db: asyncpg.Connection, task_id: str):
    await db.execute(
        'UPDATE tasks SET "aiStatus" = \'failed\', "updatedAt" = NOW() WHERE id = $1',
        task_id,
    )
