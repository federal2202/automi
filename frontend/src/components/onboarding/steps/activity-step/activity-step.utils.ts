import {
  DAYS_OF_WEEK_LONG,
  ScheduleEntry,
  WEEK_DISPLAY_ORDER,
} from '@/types/activity'

/**
 * Sort schedule entries into the canonical week display order
 * (`WEEK_DISPLAY_ORDER`) without mutating the source array. Unknown weekdays
 * sort to the front (index 0) to match the original behavior.
 */
export function sortByDisplayOrder(schedule: ScheduleEntry[]): ScheduleEntry[] {
  const orderIndex = new Map<number, number>()
  WEEK_DISPLAY_ORDER.forEach((dow, idx) => orderIndex.set(dow, idx))
  return [...schedule].sort(
    (a, b) =>
      (orderIndex.get(a.dayOfWeek) ?? 0) - (orderIndex.get(b.dayOfWeek) ?? 0)
  )
}

/**
 * Validate the activity form fields. Returns an error message (matching the
 * inline copy the step used) or `null` when valid. `title` should already be
 * trimmed by the caller.
 */
export function validateActivityForm(
  title: string,
  schedule: ScheduleEntry[]
): string | null {
  if (!title) {
    return 'Title is required.'
  }
  if (schedule.length === 0) {
    return 'Select at least one day.'
  }
  for (const entry of schedule) {
    if (!entry.startTime || !entry.endTime) {
      return 'Both start and end times are required.'
    }
    if (entry.endTime <= entry.startTime) {
      return `End time must be after start time on ${DAYS_OF_WEEK_LONG[entry.dayOfWeek]}.`
    }
  }
  return null
}
