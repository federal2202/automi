/**
 * Transforms internal CalendarEvents into Google Calendar event payloads.
 */

import { GoogleCalendarItem, GoogleCalendarDateTime } from '@/types/google-calendar.types'
import { CalendarEvent, EventType } from '@/types/calendar/calendar.types'

/**
 * Transforms internal CalendarEvent to Google Calendar event format
 * Useful for creating/updating events via API
 *
 * @param calendarEvent - Internal CalendarEvent object
 * @param calendarId - Target calendar ID
 * @returns Partial GoogleCalendarItem for API submission
 */
export const transformCalendarEventToGoogle = (
  calendarEvent: Omit<CalendarEvent, 'id'>,
  calendarId: string
): Partial<GoogleCalendarItem> => {
  // Convert dates to Google Calendar DateTime format
  const start: GoogleCalendarDateTime = {
    dateTime: calendarEvent.start.toISOString(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }

  const end: GoogleCalendarDateTime = {
    dateTime: calendarEvent.end.toISOString(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }

  // Map event type to color ID (approximate)
  const colorIdMap: Record<EventType, string> = {
    primary: '1', // Blue
    secondary: '5', // Yellow
    critical: '11', // Red
    inactive: '8', // Gray
  }

  return {
    summary: calendarEvent.title,
    description: calendarEvent.description,
    start,
    end,
    colorId: colorIdMap[calendarEvent.type],
    status: 'confirmed',
    ...(calendarEvent.isTask ? { isTask: true } : {}),
  } as Partial<GoogleCalendarItem> & { isTask?: boolean }
}
