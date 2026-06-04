import {
  DAYS_OF_WEEK_LONG,
  ScheduleEntry,
  WEEK_DISPLAY_ORDER,
} from '@/types/activity'
import { DEFAULT_END, DEFAULT_START } from './RecurringActivityForm.constants'

/** True when every entry shares identical start + end times. */
export function allEntriesShareTimes(entries: ScheduleEntry[]): boolean {
  if (entries.length === 0) return true
  const first = entries[0]
  return entries.every(
    (e) => e.startTime === first.startTime && e.endTime === first.endTime
  )
}

/** Sort entries into Mon→Sun display order without mutating the input. */
export function sortEntriesByDisplayOrder(
  schedule: ScheduleEntry[]
): ScheduleEntry[] {
  const orderIndex = new Map<number, number>()
  WEEK_DISPLAY_ORDER.forEach((dow, idx) => orderIndex.set(dow, idx))
  return [...schedule].sort(
    (a, b) =>
      (orderIndex.get(a.dayOfWeek) ?? 0) - (orderIndex.get(b.dayOfWeek) ?? 0)
  )
}

/** Toggle a weekday on/off, copying the first entry's times for new days. */
export function toggleScheduleDay(
  prev: ScheduleEntry[],
  dow: number
): ScheduleEntry[] {
  const exists = prev.some((e) => e.dayOfWeek === dow)
  if (exists) {
    return prev.filter((e) => e.dayOfWeek !== dow)
  }
  const start = prev[0]?.startTime ?? DEFAULT_START
  const end = prev[0]?.endTime ?? DEFAULT_END
  return [...prev, { dayOfWeek: dow, startTime: start, endTime: end }]
}

/** Set the same times on every entry (used by the "same time for all" path). */
export function setAllEntryTimes(
  prev: ScheduleEntry[],
  startTime: string,
  endTime: string
): ScheduleEntry[] {
  return prev.map((e) => ({ ...e, startTime, endTime }))
}

/** Patch a single entry's start/end time by weekday. */
export function setEntryTime(
  prev: ScheduleEntry[],
  dow: number,
  patch: Partial<Pick<ScheduleEntry, 'startTime' | 'endTime'>>
): ScheduleEntry[] {
  return prev.map((e) => (e.dayOfWeek === dow ? { ...e, ...patch } : e))
}

/**
 * Validate a title + schedule. Returns the first error message, or `null`
 * when the form is valid.
 */
export function validateActivityForm(
  title: string,
  schedule: ScheduleEntry[]
): string | null {
  if (!title) return 'Title is required.'
  if (schedule.length === 0) return 'Select at least one day.'
  for (const entry of schedule) {
    if (!entry.startTime || !entry.endTime) {
      return 'Both start and end times are required.'
    }
    // Both values are `HH:mm` so lexicographic compare matches chronological.
    if (entry.endTime <= entry.startTime) {
      return `End time must be after start time on ${DAYS_OF_WEEK_LONG[entry.dayOfWeek]}.`
    }
  }
  return null
}
