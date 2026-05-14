/**
 * A single per-weekday time window for a recurring activity. `dayOfWeek`
 * follows the US/JS convention: `0=Sun, 1=Mon, … 6=Sat`. Times are 24h
 * zero-padded `HH:mm`. Server enforces `endTime > startTime` per entry.
 */
export interface ScheduleEntry {
  dayOfWeek: number
  startTime: string
  endTime: string
}

/**
 * `schedule` is a non-empty array; each entry pins a weekday to its own
 * start/end window. Display order is controlled separately via
 * `WEEK_DISPLAY_ORDER` so we can render Mon-first without touching storage.
 */
export interface RecurringActivity {
  id: string
  userId: string
  periodId: string
  title: string
  schedule: ScheduleEntry[]
  createdAt: string
  updatedAt: string
}

export interface CreateActivityInput {
  title: string
  schedule: ScheduleEntry[]
}

// The form always submits the full record on edit, so update accepts the same
// shape as create. (Matches the Step 1 lesson with `UpdatePeriodInput`.)
export type UpdateActivityInput = CreateActivityInput

/**
 * Index 0..6 → short labels, indexed by the persisted day-of-week integer.
 * Order matches the JS/US convention (0=Sun..6=Sat) so `DAYS_OF_WEEK[dow]`
 * always works directly with the stored value.
 */
export const DAYS_OF_WEEK: readonly string[] = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
] as const

export const DAYS_OF_WEEK_LONG: readonly string[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

/**
 * Display order: Monday → Sunday. European/work-focused UX.
 * Use this to iterate groups in render order; the values are the persisted
 * day-of-week ints so callers can key activity buckets directly.
 */
export const WEEK_DISPLAY_ORDER: readonly number[] = [1, 2, 3, 4, 5, 6, 0] as const
