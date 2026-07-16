import { describe, it, expect } from "vitest";
import {
  wallClockToUTC,
  localDayOfWeek,
  utcMidnightForLocalDay,
} from "../src/services/calendar-sync.service";

describe("wallClockToUTC — edge cases", () => {
  it("converts 09:00 Europe/Warsaw in winter to 08:00 UTC (UTC+1)", () => {
    const day = new Date("2026-01-15T00:00:00Z");
    expect(wallClockToUTC(day, "09:00", "Europe/Warsaw")).toBe("2026-01-15T08:00:00.000Z");
  });

  it("converts 09:00 Europe/Warsaw in summer to 07:00 UTC (UTC+2, DST)", () => {
    const day = new Date("2026-07-15T00:00:00Z");
    expect(wallClockToUTC(day, "09:00", "Europe/Warsaw")).toBe("2026-07-15T07:00:00.000Z");
  });

  // EDGE: the DST-forward night — 02:30 does not exist in Europe/Warsaw on
  // 2026-03-29 (clocks jump 02:00 -> 03:00). Must not throw.
  it("does not throw on a local time that does not exist during the DST-forward transition", () => {
    const day = new Date("2026-03-29T00:00:00Z");
    expect(() => wallClockToUTC(day, "02:30", "Europe/Warsaw")).not.toThrow();
  });

  // EDGE: the DST-back night — 02:30 happens twice in Europe/Warsaw on
  // 2026-10-25. Must resolve to *a* consistent UTC instant, not throw/NaN.
  it("does not throw on a local time that occurs twice during the DST-back transition", () => {
    const day = new Date("2026-10-25T00:00:00Z");
    const result = wallClockToUTC(day, "02:30", "Europe/Warsaw");
    expect(() => wallClockToUTC(day, "02:30", "Europe/Warsaw")).not.toThrow();
    expect(Number.isNaN(new Date(result).getTime())).toBe(false);
  });

  it("handles a fixed-offset timezone (no DST) the same in winter and summer", () => {
    const winter = new Date("2026-01-15T00:00:00Z");
    const summer = new Date("2026-07-15T00:00:00Z");
    expect(wallClockToUTC(winter, "09:00", "UTC")).toBe("2026-01-15T09:00:00.000Z");
    expect(wallClockToUTC(summer, "09:00", "UTC")).toBe("2026-07-15T09:00:00.000Z");
  });
});

describe("localDayOfWeek", () => {
  // EDGE: a user on the far side of the international date line (UTC+14) can
  // be a full calendar day ahead of UTC.
  it("computes the correct day of week for a user in Pacific/Kiritimati (UTC+14)", () => {
    // 2026-07-03 23:00 UTC = 2026-07-04 13:00 in UTC+14 (Saturday)
    const d = new Date("2026-07-03T23:00:00Z");
    expect(localDayOfWeek(d, "Pacific/Kiritimati")).toBe(6); // Saturday
    expect(localDayOfWeek(d, "UTC")).toBe(5); // Friday
  });

  it("computes the correct day of week for a user far behind UTC (Pacific/Midway, UTC-11)", () => {
    // 2026-07-04 03:00 UTC = 2026-07-03 16:00 in UTC-11 (still Friday)
    const d = new Date("2026-07-04T03:00:00Z");
    expect(localDayOfWeek(d, "Pacific/Midway")).toBe(5); // Friday
    expect(localDayOfWeek(d, "UTC")).toBe(6); // Saturday
  });
});

describe("utcMidnightForLocalDay", () => {
  it("local midnight differs from UTC midnight for a non-UTC zone", () => {
    const d = new Date("2026-07-03T23:30:00Z");
    // In Asia/Tokyo (UTC+9) this instant is already 2026-07-04 08:30, so the
    // local calendar day's midnight is 2026-07-03T15:00:00Z.
    expect(utcMidnightForLocalDay(d, "Asia/Tokyo").toISOString()).toBe("2026-07-03T15:00:00.000Z");
  });

  it("matches UTC midnight exactly for the UTC timezone", () => {
    const d = new Date("2026-07-03T23:30:00Z");
    expect(utcMidnightForLocalDay(d, "UTC").toISOString()).toBe("2026-07-03T00:00:00.000Z");
  });
});
