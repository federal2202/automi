import { CreatePeriodInput } from '@/types/period'

/**
 * Extract the calendar date (YYYY-MM-DD) directly from the ISO string.
 *
 * IMPORTANT: We never run the value through `new Date(...)` here. A "date-only"
 * period boundary like "2026-05-13T00:00:00.000Z" parsed in a non-UTC zone
 * shifts backward/forward by hours, which previously caused the date input
 * to display the wrong day on DST boundaries. Slicing the first 10 chars
 * of the canonical ISO string is timezone-free.
 */
export function isoToDateInput(value?: string): string {
  if (!value) return ''
  // Defensive: anything we accept here should already be ISO-8601, but if a
  // caller passes a non-string or short string, fall back to empty.
  if (typeof value !== 'string' || value.length < 10) return ''
  return value.slice(0, 10)
}

/**
 * Convert a `<input type="date">` value back to a canonical ISO string that
 * round-trips losslessly with `isoToDateInput`. Stays at midnight UTC so the
 * date component is preserved regardless of the viewer's timezone.
 */
export function dateInputToIso(value: string): string {
  return `${value}T00:00:00.000Z`
}

/**
 * Validate the raw form fields. Returns an error message (matching the inline
 * copy the dialog used) or `null` when the fields are valid.
 */
export function validatePeriodForm(
  title: string,
  startDate: string,
  endDate: string
): string | null {
  if (!title) {
    return 'Title is required.'
  }
  if (!startDate || !endDate) {
    return 'Both start and end dates are required.'
  }
  // Pure lexicographic compare — both values are YYYY-MM-DD here.
  if (endDate < startDate) {
    return 'End date must be on or after start date.'
  }
  return null
}

/** Build the API payload from validated, trimmed form fields. */
export function toPeriodInput(
  title: string,
  startDate: string,
  endDate: string
): CreatePeriodInput {
  return {
    title,
    startDate: dateInputToIso(startDate),
    endDate: dateInputToIso(endDate),
  }
}
