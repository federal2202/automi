import { ScheduleEntry, WEEK_DISPLAY_ORDER } from '@/types/activity'

/**
 * Sort schedule entries in Mon→Sun display order so rendered lines are
 * ordered consistently with the surrounding day-bucket sections.
 */
export function sortScheduleForDisplay(
  schedule: ScheduleEntry[]
): ScheduleEntry[] {
  return WEEK_DISPLAY_ORDER.flatMap((dow) =>
    schedule.filter((e) => e.dayOfWeek === dow)
  )
}

/**
 * Collapse to a single line when every entry shares identical times; this is
 * the common case (e.g. "Mon, Wed, Fri · 06:00–08:00"). Returns `false` for an
 * empty array so callers never collapse a schedule with nothing to show.
 */
export function entriesShareTimes(entries: ScheduleEntry[]): boolean {
  return (
    entries.length > 0 &&
    entries.every(
      (e) =>
        e.startTime === entries[0].startTime &&
        e.endTime === entries[0].endTime
    )
  )
}
