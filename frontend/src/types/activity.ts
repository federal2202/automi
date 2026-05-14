/**
 * `daysOfWeek` follows the US/JS convention: `0=Sun, 1=Mon, … 6=Sat`.
 * Persisted as a non-empty array of integers; display order is controlled
 * separately via `WEEK_DISPLAY_ORDER` so we can render Mon-first without
 * touching storage.
 */
export interface RecurringActivity {
  id: string
  userId: string
  periodId: string
  title: string
  daysOfWeek: number[]
  /** 24h `HH:mm`, zero-padded. */
  startTime: string
  /** 24h `HH:mm`, zero-padded. Server enforces `endTime > startTime`. */
  endTime: string
  createdAt: string
  updatedAt: string
}

export interface CreateActivityInput {
  title: string
  daysOfWeek: number[]
  startTime: string
  endTime: string
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
