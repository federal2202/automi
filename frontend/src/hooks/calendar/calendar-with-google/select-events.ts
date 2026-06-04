import { CalendarEvent } from '@/types/calendar/calendar.types'

/**
 * Decide which events to render: live Google Calendar data when available and
 * not errored, otherwise the sample events fallback. Extracted from
 * `useCalendarWithGoogle` so the derived-state logic stays testable.
 */
export function selectEvents(
  googleEvents: readonly CalendarEvent[],
  eventsError: unknown,
  sampleEvents: CalendarEvent[]
): CalendarEvent[] {
  // If Google Calendar data is available and not in error state, use it
  if (googleEvents.length > 0 && !eventsError) {
    return [...googleEvents] // Convert readonly to mutable
  }

  // Fall back to sample events if Google Calendar is unavailable
  return sampleEvents
}

/**
 * Whether the live Google Calendar source is currently in use.
 */
export function isUsingGoogle(
  googleEvents: readonly CalendarEvent[],
  eventsError: unknown
): boolean {
  return googleEvents.length > 0 && !eventsError
}
