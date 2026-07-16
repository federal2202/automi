import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

import ai_worker


def make_valid_raw(**overrides):
    raw = {
        "title": "Prepare slides",
        "description": "Build the deck for the review",
        "estimatedTimeMinutes": 30,
        "difficulty": "medium",
        "steps": [{"stepNumber": 1, "title": "s", "instruction": "i"}],
        "resources": [],
        "successCriteria": "Deck is ready",
    }
    raw.update(overrides)
    return raw


class TestValidateTask:
    def test_accepts_valid_input(self):
        task = ai_worker.validate_task(make_valid_raw())
        assert task["difficulty"] == "medium"
        assert task["estimatedTimeMinutes"] == 30

    def test_rejects_non_dict(self):
        with pytest.raises(ValueError):
            ai_worker.validate_task("not a dict")

    @pytest.mark.parametrize("field", ["title", "description", "successCriteria"])
    def test_rejects_missing_required_string_field(self, field):
        with pytest.raises(ValueError):
            ai_worker.validate_task(make_valid_raw(**{field: ""}))

    def test_rejects_invalid_difficulty(self):
        with pytest.raises(ValueError):
            ai_worker.validate_task(make_valid_raw(difficulty="trivial"))

    # BUG-10 regression: Gemini can return a float or a numeric string for a
    # field the DB stores as Int — this must be coerced, not silently break
    # the insert.
    def test_coerces_float_minutes_to_int(self):
        task = ai_worker.validate_task(make_valid_raw(estimatedTimeMinutes=12.7))
        assert task["estimatedTimeMinutes"] == 13
        assert isinstance(task["estimatedTimeMinutes"], int)

    # EDGE: Python's round() is banker's rounding (ties go to the nearest
    # even integer), so exactly-.5 values don't always round up. Documenting
    # this rather than asserting the "intuitive" (and wrong) 13 here.
    def test_exact_half_rounds_to_even_not_always_up(self):
        task = ai_worker.validate_task(make_valid_raw(estimatedTimeMinutes=12.5))
        assert task["estimatedTimeMinutes"] == 12

    def test_coerces_numeric_string_minutes_to_int(self):
        task = ai_worker.validate_task(make_valid_raw(estimatedTimeMinutes="30"))
        assert task["estimatedTimeMinutes"] == 30
        assert isinstance(task["estimatedTimeMinutes"], int)

    def test_rejects_non_positive_minutes(self):
        with pytest.raises(ValueError):
            ai_worker.validate_task(make_valid_raw(estimatedTimeMinutes=0))

    def test_rejects_non_numeric_minutes(self):
        with pytest.raises(ValueError):
            ai_worker.validate_task(make_valid_raw(estimatedTimeMinutes="not-a-number"))

    def test_rejects_non_list_steps(self):
        with pytest.raises(ValueError):
            ai_worker.validate_task(make_valid_raw(steps="nope"))

    def test_defaults_resources_to_empty_list_when_not_a_list(self):
        task = ai_worker.validate_task(make_valid_raw(resources="nope"))
        assert task["resources"] == []


class TestGenerateTask:
    @pytest.mark.asyncio
    async def test_parses_clean_json(self):
        fake = MagicMock()
        fake.text = json.dumps(make_valid_raw())
        with patch.object(ai_worker.model, "generate_content", return_value=fake):
            task = await ai_worker.generate_task("Prepare slides")
            assert task["difficulty"] == "medium"

    # BUG-3 regression: the model sometimes wraps its JSON in a markdown code
    # fence even with response_mime_type set — this must be stripped, not
    # left to blow up json.loads.
    @pytest.mark.asyncio
    async def test_strips_markdown_fences_before_parsing(self):
        fake = MagicMock()
        fake.text = f"```json\n{json.dumps(make_valid_raw())}\n```"
        with patch.object(ai_worker.model, "generate_content", return_value=fake):
            task = await ai_worker.generate_task("Prepare slides")
            assert task["title"] == "Prepare slides"

    @pytest.mark.asyncio
    async def test_raises_on_unparseable_response(self):
        fake = MagicMock()
        fake.text = "not json at all"
        with patch.object(ai_worker.model, "generate_content", return_value=fake):
            with pytest.raises(json.JSONDecodeError):
                await ai_worker.generate_task("Prepare slides")

    @pytest.mark.asyncio
    async def test_raises_on_incomplete_fields(self):
        fake = MagicMock()
        fake.text = json.dumps({"title": "T"})
        with patch.object(ai_worker.model, "generate_content", return_value=fake):
            with pytest.raises(ValueError):
                await ai_worker.generate_task("Prepare slides")


class TestSaveTask:
    @pytest.mark.asyncio
    async def test_writes_coerced_fields_and_marks_done(self):
        db = AsyncMock()
        task = ai_worker.validate_task(make_valid_raw(estimatedTimeMinutes=12.7))

        await ai_worker.save_task(db, "task-1", task)

        args = db.execute.call_args[0]
        sql = args[0]
        assert "aiStatus" in sql and "'done'" in sql
        assert args[1] == "task-1"
        assert args[4] == 13  # estimatedTimeMinutes, coerced to int
        assert isinstance(args[4], int)
        assert json.loads(args[6]) == task["steps"]  # steps serialized as JSON text


class TestMarkFailed:
    @pytest.mark.asyncio
    async def test_sets_ai_status_failed(self):
        db = AsyncMock()
        await ai_worker.mark_failed(db, "task-2")

        args = db.execute.call_args[0]
        assert "failed" in args[0]
        assert args[1] == "task-2"
