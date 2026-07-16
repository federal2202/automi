import { describe, it, expect } from "vitest";
import { parseAndValidateActivity } from "../src/controllers/recurring-activities.controller";

const base = { title: "Gym", schedule: [{ dayOfWeek: 1, startTime: "09:00", endTime: "10:00" }] };

describe("parseAndValidateActivity", () => {
  it("accepts valid input", () => {
    expect(parseAndValidateActivity(base).ok).toBe(true);
  });

  it.each([
    [{ ...base, title: "   " }, "blank title after trim"],
    [{ ...base, schedule: [] }, "empty schedule"],
    [{ ...base, schedule: [{ dayOfWeek: 7, startTime: "09:00", endTime: "10:00" }] }, "dayOfWeek=7 out of range"],
    [{ ...base, schedule: [{ dayOfWeek: -1, startTime: "09:00", endTime: "10:00" }] }, "dayOfWeek=-1 out of range"],
    [{ ...base, schedule: [{ dayOfWeek: 1, startTime: "9:00", endTime: "10:00" }] }, "startTime missing leading zero"],
    [{ ...base, schedule: [{ dayOfWeek: 1, startTime: "24:00", endTime: "25:00" }] }, "hour > 23"],
    [{ ...base, schedule: [{ dayOfWeek: 1, startTime: "10:00", endTime: "10:00" }] }, "end == start"],
    [{ ...base, schedule: [{ dayOfWeek: 1, startTime: "10:00", endTime: "09:00" }] }, "end < start"],
    [
      {
        ...base,
        schedule: [
          { dayOfWeek: 1, startTime: "09:00", endTime: "10:00" },
          { dayOfWeek: 1, startTime: "11:00", endTime: "12:00" },
        ],
      },
      "duplicate dayOfWeek",
    ],
  ])("rejects: %s", (input) => {
    expect(parseAndValidateActivity(input as any).ok).toBe(false);
  });

  // Not a bug — documented by-design behavior: overlap is only rejected
  // within the same dayOfWeek entry, not across different days.
  it("does not reject overlapping slots on different days (by design)", () => {
    expect(
      parseAndValidateActivity({
        ...base,
        schedule: [{ dayOfWeek: 0, startTime: "23:00", endTime: "23:59" }],
      }).ok
    ).toBe(true);
  });
});
