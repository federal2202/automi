/**
 * Shared `<input type="date">` <-> ISO string helpers.
 *
 * Dates round-trip as `YYYY-MM-DDT00:00:00.000Z` and never run through
 * `new Date()` to avoid DST-related day shifts: a "date-only" boundary parsed
 * in a non-UTC zone shifts by hours and lands on the wrong day. Slicing the
 * canonical ISO string is timezone-free.
 */

/** Extract the calendar date (`YYYY-MM-DD`) prefix from an ISO string. */
export function isoToDateInput(value?: string): string {
  if (!value) return ''
  if (typeof value !== 'string' || value.length < 10) return ''
  return value.slice(0, 10)
}

/** Convert a `<input type="date">` value to a canonical midnight-UTC ISO string. */
export function dateInputToIso(value: string): string {
  return `${value}T00:00:00.000Z`
}
