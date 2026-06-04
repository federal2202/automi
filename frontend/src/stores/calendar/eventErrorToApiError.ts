import type { CalendarApiError } from '../calendarSlice'

/**
 * Maps an unknown thrown error from a Google Calendar mutation into the slice's
 * `CalendarApiError` shape. Extracted verbatim from the inline `catch` blocks
 * in `useEventManagement` — no behavior change.
 */
export const eventErrorToApiError = (
  err: unknown,
  fallbackMessage: string
): CalendarApiError => {
  const e = err as { message?: string; type?: string }
  return {
    message: e?.message || fallbackMessage,
    type: e?.type || 'UNKNOWN_ERROR',
  }
}
