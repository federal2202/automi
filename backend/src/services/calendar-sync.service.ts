/**
 * calendar-sync.service.ts
 *
 * All Google Calendar lifecycle sync logic lives here.
 * DB writes are the source of truth; Google Calendar is best-effort.
 *
 * Functions:
 *  - generateEventsForActivity  — create events for days in period that match schedule
 *  - deleteEventsForActivity    — delete all synced events for one activity
 *  - updateEventsForActivity    — patch or re-generate events when an activity changes
 *  - deleteEventsForPeriod      — fan-out delete to all activities in a period
 *  - syncPeriodDateRange        — handle period start/end date changes
 */

import pLimit from "p-limit";
import { fromZonedTime } from "date-fns-tz";
import { prisma } from "../lib/prisma";
import { buildCalendarClient } from "../lib/google-calendar";
import type { RecurringActivity, Period } from "../../generated/prisma/client";

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

export type ScheduleEntry = { dayOfWeek: number; startTime: string; endTime: string };

export interface SyncResult {
  created: number;
  skipped: number;
  errors: Array<{ activityId?: string; date: string; message: string }>;
}

export interface DeleteResult {
  deleted: number;
  errors: Array<{ activityId?: string; date: string; message: string }>;
}

export interface UpdateResult {
  updated: number;
  deleted: number;
  created: number;
  errors: Array<{ activityId?: string; date: string; message: string }>;
}

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

const CONCURRENCY = 10;
const SOURCE_TYPE = "recurring_activity";

/** Cast the opaque Json column to a typed ScheduleEntry array. */
function getSchedule(activity: RecurringActivity): ScheduleEntry[] {
  return activity.schedule as unknown as ScheduleEntry[];
}

/**
 * Sort a schedule by dayOfWeek then stringify — used for deep equality check
 * to decide whether a full delete+regenerate is needed.
 */
function canonicalSchedule(schedule: ScheduleEntry[]): string {
  return JSON.stringify(
    [...schedule].sort((a, b) => a.dayOfWeek - b.dayOfWeek),
  );
}

/** Returns the JS day-of-week index (0=Sun…6=Sat) for a Date in a given tz. */
function localDayOfWeek(utcDate: Date, timezone: string): number {
  // Build a Date in the user's tz by reading a formatted string.
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
  });
  const name = formatter.format(utcDate);
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[name] ?? -1;
}

/**
 * Iterate every UTC midnight from startUTC through endUTC (inclusive) in
 * steps of 1 day.  Yields the UTC midnight Date for each step.
 */
function* iterateDays(startUTC: Date, endUTC: Date): Generator<Date> {
  const cursor = new Date(startUTC);
  cursor.setUTCHours(0, 0, 0, 0);
  const endMs = endUTC.getTime();
  while (cursor.getTime() <= endMs) {
    yield new Date(cursor);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
}

/**
 * Given a calendar day represented as a UTC-midnight Date and a "HH:MM" wall-
 * clock time in the user's timezone, returns the equivalent UTC ISO string for
 * use in Google Calendar's start.dateTime / end.dateTime.
 *
 * Strategy: build a local-time string "YYYY-MM-DDTHH:MM:00" using the date
 * portion in the user's tz, then use fromZonedTime to convert to UTC.
 */
function wallClockToUTC(dayUTC: Date, time: string, timezone: string): string {
  // Get the local YYYY-MM-DD for this UTC midnight in the user's tz.
  const localDateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(dayUTC); // "YYYY-MM-DD" (en-CA uses ISO-like format)

  const localDateTime = `${localDateStr}T${time}:00`;
  const utcDate = fromZonedTime(localDateTime, timezone);
  return utcDate.toISOString();
}

/**
 * Returns UTC midnight of the calendar day that contains `date` in `timezone`.
 * Used as the dedupe key stored in SyncedEvent.date.
 */
function utcMidnightForLocalDay(date: Date, timezone: string): Date {
  const localDateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return fromZonedTime(`${localDateStr}T00:00:00`, timezone);
}

/** Fetch user row (needs timezone + Google tokens). */
async function fetchUser(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

// -------------------------------------------------------------------
// generateEventsForActivity
// -------------------------------------------------------------------

export async function generateEventsForActivity(
  userId: string,
  activity: RecurringActivity,
  period: Period,
): Promise<SyncResult> {
  const result: SyncResult = { created: 0, skipped: 0, errors: [] };

  const user = await fetchUser(userId);
  if (!user) {
    result.errors.push({ activityId: activity.id, date: "N/A", message: "User not found" });
    return result;
  }

  const timezone = user.timezone;
  const calEvents = buildCalendarClient(user);

  // Start from max(period.startDate, today in user's tz).
  const todayUtcMidnight = utcMidnightForLocalDay(new Date(), timezone);
  const rangeStart = period.startDate > todayUtcMidnight ? period.startDate : todayUtcMidnight;
  const rangeEnd = period.endDate;

  if (rangeStart > rangeEnd) return result; // period already in the past

  const schedule = getSchedule(activity);
  const limit = pLimit(CONCURRENCY);
  const tasks: Array<Promise<void>> = [];

  for (const dayUTC of iterateDays(rangeStart, rangeEnd)) {
    const dow = localDayOfWeek(dayUTC, timezone);
    const entry = schedule.find((e) => e.dayOfWeek === dow);
    if (!entry) continue;

    const dedupeDate = utcMidnightForLocalDay(dayUTC, timezone);
    const dateLabel = dedupeDate.toISOString().slice(0, 10);

    tasks.push(
      limit(async () => {
        try {
          const startUTC = wallClockToUTC(dayUTC, entry.startTime, timezone);
          const endUTC = wallClockToUTC(dayUTC, entry.endTime, timezone);

          const googleEvent = await calEvents.insert({
            calendarId: "primary",
            requestBody: {
              summary: activity.title,
              start: { dateTime: startUTC },
              end: { dateTime: endUTC },
            },
          });

          const googleEventId = googleEvent.data.id!;

          await prisma.syncedEvent.create({
            data: {
              userId,
              googleEventId,
              sourceType: SOURCE_TYPE,
              sourceId: activity.id,
              date: dedupeDate,
            },
          });

          result.created += 1;
        } catch (err: unknown) {
          // Unique constraint violation = already synced → skip.
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("Unique constraint") || msg.includes("unique constraint")) {
            result.skipped += 1;
          } else {
            result.errors.push({ activityId: activity.id, date: dateLabel, message: msg });
          }
        }
      }),
    );
  }

  await Promise.all(tasks);
  return result;
}

// -------------------------------------------------------------------
// deleteEventsForActivity
// -------------------------------------------------------------------

export async function deleteEventsForActivity(
  userId: string,
  activityId: string,
): Promise<DeleteResult> {
  const result: DeleteResult = { deleted: 0, errors: [] };

  const user = await fetchUser(userId);
  if (!user) {
    result.errors.push({ activityId, date: "N/A", message: "User not found" });
    return result;
  }

  const syncedRows = await prisma.syncedEvent.findMany({
    where: { userId, sourceType: SOURCE_TYPE, sourceId: activityId },
  });

  if (syncedRows.length === 0) return result;

  const calEvents = buildCalendarClient(user);
  const limit = pLimit(CONCURRENCY);

  const tasks = syncedRows.map((row) =>
    limit(async () => {
      const dateLabel = row.date.toISOString().slice(0, 10);
      try {
        await calEvents.delete({ calendarId: "primary", eventId: row.googleEventId });
      } catch (err: unknown) {
        // 404 = already gone on Google side — treat as success for our purposes.
        const status = (err as { code?: number; status?: number })?.code ??
          (err as { code?: number; status?: number })?.status;
        if (status !== 404 && status !== 410) {
          const msg = err instanceof Error ? err.message : String(err);
          result.errors.push({ activityId, date: dateLabel, message: msg });
          return; // leave DB row in place if Google delete failed
        }
      }
      // Delete mapping row.
      try {
        await prisma.syncedEvent.delete({ where: { id: row.id } });
        result.deleted += 1;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        result.errors.push({ activityId, date: dateLabel, message: `DB delete failed: ${msg}` });
      }
    }),
  );

  await Promise.all(tasks);
  return result;
}

// -------------------------------------------------------------------
// updateEventsForActivity
// -------------------------------------------------------------------

export async function updateEventsForActivity(
  userId: string,
  oldActivity: RecurringActivity,
  newActivity: RecurringActivity,
  period: Period,
): Promise<UpdateResult> {
  const result: UpdateResult = { updated: 0, deleted: 0, created: 0, errors: [] };

  // Deep-compare schedules: sort both by dayOfWeek then stringify.
  const scheduleChanged =
    canonicalSchedule(getSchedule(oldActivity)) !== canonicalSchedule(getSchedule(newActivity));

  if (scheduleChanged) {
    // Full regenerate: delete all old events then create new ones.
    const del = await deleteEventsForActivity(userId, oldActivity.id);
    result.deleted += del.deleted;
    result.errors.push(...del.errors);

    const gen = await generateEventsForActivity(userId, newActivity, period);
    result.created += gen.created;
    result.errors.push(...gen.errors);
  } else {
    // Schedules are identical — only title changed. Patch existing Google events.
    const user = await fetchUser(userId);
    if (!user) {
      result.errors.push({ activityId: newActivity.id, date: "N/A", message: "User not found" });
      return result;
    }

    const timezone = user.timezone;
    const calEvents = buildCalendarClient(user);
    const newSchedule = getSchedule(newActivity);

    const syncedRows = await prisma.syncedEvent.findMany({
      where: { userId, sourceType: SOURCE_TYPE, sourceId: oldActivity.id },
    });

    const limit = pLimit(CONCURRENCY);

    const tasks = syncedRows.map((row) =>
      limit(async () => {
        const dateLabel = row.date.toISOString().slice(0, 10);
        try {
          // Find the schedule entry for the day this event falls on.
          const dow = localDayOfWeek(row.date, timezone);
          const entry = newSchedule.find((e) => e.dayOfWeek === dow);

          // Defensive: if no schedule entry for this day, skip rather than crash.
          if (!entry) return;

          const startUTC = wallClockToUTC(row.date, entry.startTime, timezone);
          const endUTC = wallClockToUTC(row.date, entry.endTime, timezone);

          await calEvents.patch({
            calendarId: "primary",
            eventId: row.googleEventId,
            requestBody: {
              summary: newActivity.title,
              start: { dateTime: startUTC },
              end: { dateTime: endUTC },
            },
          });

          result.updated += 1;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          result.errors.push({ activityId: newActivity.id, date: dateLabel, message: msg });
        }
      }),
    );

    await Promise.all(tasks);
  }

  return result;
}

// -------------------------------------------------------------------
// deleteEventsForPeriod
// -------------------------------------------------------------------

export async function deleteEventsForPeriod(
  userId: string,
  periodId: string,
): Promise<DeleteResult> {
  const activities = await prisma.recurringActivity.findMany({
    where: { userId, periodId },
    select: { id: true },
  });

  const aggregate: DeleteResult = { deleted: 0, errors: [] };

  // Fan out to each activity (each individually uses p-limit internally).
  for (const activity of activities) {
    const r = await deleteEventsForActivity(userId, activity.id);
    aggregate.deleted += r.deleted;
    aggregate.errors.push(...r.errors);
  }

  return aggregate;
}

// -------------------------------------------------------------------
// syncPeriodDateRange
// -------------------------------------------------------------------

export async function syncPeriodDateRange(
  userId: string,
  period: Period,
  oldStart: Date,
  oldEnd: Date,
): Promise<SyncResult & DeleteResult> {
  const result: SyncResult & DeleteResult = { created: 0, skipped: 0, deleted: 0, errors: [] };

  const user = await fetchUser(userId);
  if (!user) {
    result.errors.push({ date: "N/A", message: "User not found" });
    return result;
  }

  const timezone = user.timezone;
  const calEvents = buildCalendarClient(user);
  const todayUtcMidnight = utcMidnightForLocalDay(new Date(), timezone);

  const activities = await prisma.recurringActivity.findMany({
    where: { userId, periodId: period.id },
  });

  const limit = pLimit(CONCURRENCY);

  for (const activity of activities) {
    const schedule = getSchedule(activity);

    // --- Delete events that fall outside the NEW date range ---
    const orphans = await prisma.syncedEvent.findMany({
      where: {
        userId,
        sourceType: SOURCE_TYPE,
        sourceId: activity.id,
        OR: [
          { date: { lt: period.startDate } },
          { date: { gt: period.endDate } },
        ],
      },
    });

    const deleteTasks = orphans.map((row) =>
      limit(async () => {
        const dateLabel = row.date.toISOString().slice(0, 10);
        try {
          await calEvents.delete({ calendarId: "primary", eventId: row.googleEventId });
        } catch (err: unknown) {
          const status = (err as { code?: number; status?: number })?.code ??
            (err as { code?: number; status?: number })?.status;
          if (status !== 404 && status !== 410) {
            const msg = err instanceof Error ? err.message : String(err);
            result.errors.push({ activityId: activity.id, date: dateLabel, message: msg });
            return;
          }
        }
        try {
          await prisma.syncedEvent.delete({ where: { id: row.id } });
          result.deleted += 1;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          result.errors.push({ activityId: activity.id, date: dateLabel, message: `DB delete: ${msg}` });
        }
      }),
    );
    await Promise.all(deleteTasks);

    // --- Generate events for newly added days (start extended earlier or end extended later) ---
    const newRanges: Array<{ from: Date; to: Date }> = [];

    // Extended start: new start is earlier than old start
    if (period.startDate < oldStart) {
      newRanges.push({ from: period.startDate, to: new Date(oldStart.getTime() - 86400000) });
    }
    // Extended end: new end is later than old end
    if (period.endDate > oldEnd) {
      newRanges.push({ from: new Date(oldEnd.getTime() + 86400000), to: period.endDate });
    }

    for (const range of newRanges) {
      const rangeStart = range.from > todayUtcMidnight ? range.from : todayUtcMidnight;
      if (rangeStart > range.to) continue;

      const genTasks: Array<Promise<void>> = [];

      for (const dayUTC of iterateDays(rangeStart, range.to)) {
        const dow = localDayOfWeek(dayUTC, timezone);
        const entry = schedule.find((e) => e.dayOfWeek === dow);
        if (!entry) continue;

        const dedupeDate = utcMidnightForLocalDay(dayUTC, timezone);
        const dateLabel = dedupeDate.toISOString().slice(0, 10);

        genTasks.push(
          limit(async () => {
            try {
              const startUTC = wallClockToUTC(dayUTC, entry.startTime, timezone);
              const endUTC = wallClockToUTC(dayUTC, entry.endTime, timezone);

              const googleEvent = await calEvents.insert({
                calendarId: "primary",
                requestBody: {
                  summary: activity.title,
                  start: { dateTime: startUTC },
                  end: { dateTime: endUTC },
                },
              });

              await prisma.syncedEvent.create({
                data: {
                  userId,
                  googleEventId: googleEvent.data.id!,
                  sourceType: SOURCE_TYPE,
                  sourceId: activity.id,
                  date: dedupeDate,
                },
              });

              result.created += 1;
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : String(err);
              if (msg.includes("Unique constraint") || msg.includes("unique constraint")) {
                result.skipped += 1;
              } else {
                result.errors.push({ activityId: activity.id, date: dateLabel, message: msg });
              }
            }
          }),
        );
      }

      await Promise.all(genTasks);
    }
  }

  return result;
}
