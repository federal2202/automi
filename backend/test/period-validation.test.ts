import { describe, it, expect } from "vitest";
import { parseAndValidatePeriod } from "../src/controllers/periods.controller";

const base = { title: "Q3", startDate: "2026-07-01T00:00:00Z", endDate: "2026-09-30T00:00:00Z" };

describe("parseAndValidatePeriod", () => {
  it("accepts valid input", () => {
    expect(parseAndValidatePeriod(base).ok).toBe(true);
  });

  it.each([
    [{ ...base, title: "   " }, "blank title after trim"],
    [{ ...base, startDate: "not-a-date" }, "invalid startDate"],
    [{ ...base, endDate: "not-a-date" }, "invalid endDate"],
    [{ ...base, startDate: 123 }, "startDate not a string"],
    [{ ...base, endDate: "2026-01-01T00:00:00Z" }, "endDate before startDate"],
  ])("rejects: %s", (input) => {
    expect(parseAndValidatePeriod(input as any).ok).toBe(false);
  });

  it("accepts endDate equal to startDate (single-day period)", () => {
    expect(
      parseAndValidatePeriod({ ...base, endDate: base.startDate }).ok
    ).toBe(true);
  });
});
