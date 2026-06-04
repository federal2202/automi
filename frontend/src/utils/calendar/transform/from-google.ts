/**
 * Transforms from Google Calendar events into internal CalendarEvents.
 */

import { GoogleCalendarItem, GoogleEventsResponse } from '@/types/google-calendar.types'
import { CalendarEvent } from '@/types/calendar/calendar.types'
import { isValidGoogleEvent } from './validation'
import { parseGoogleDateTime, determineEventType } from './parsing'

/**
 * Transforms a Google Calendar event to internal CalendarEvent format
 *
 * @param googleEvent - Google Calendar API event object
 * @returns Transformed CalendarEvent object
 * @throws Error if googleEvent is invalid
 */
export const transformGoogleEventToCalendarEvent = (
  googleEvent: GoogleCalendarItem
): CalendarEvent => {
  if (!isValidGoogleEvent(googleEvent)) {
    throw new Error('Invalid Google Calendar event object')
  }

  try {
    const start = parseGoogleDateTime(googleEvent.start)
    const end = parseGoogleDateTime(googleEvent.end)
    const type = determineEventType(googleEvent)

    return {
      id: googleEvent.id,
      title: googleEvent.summary,
      start,
      end,
      type,
      description: googleEvent.description || undefined,
    }
  } catch (error) {
    throw new Error(
      `Failed to transform Google event "${googleEvent.summary}": ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}

/**
 * Transforms Google Events Response to array of CalendarEvent objects
 *
 * @param response - Google Calendar API events response
 * @returns Array of transformed CalendarEvent objects
 * @throws Error if response is invalid
 */
export const transformGoogleEventsResponse = (
  response: GoogleEventsResponse
): readonly CalendarEvent[] => {
  if (!response || !Array.isArray(response.items)) {
    throw new Error('Invalid Google Events Response: missing or invalid items array')
  }

  const transformedEvents: CalendarEvent[] = []
  const errors: string[] = []

  for (const item of response.items) {
    try {
      transformedEvents.push(transformGoogleEventToCalendarEvent(item))
    } catch (error) {
      // Log transformation error but continue with other events
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      errors.push(`Event ${item.id || 'unknown'}: ${errorMessage}`)
    }
  }

  // If there were transformation errors, log them but don't fail completely
  if (errors.length > 0) {
    console.warn('Calendar event transformation errors:', errors)
  }

  return transformedEvents
}

/**
 * Transforms array of Google Calendar events to CalendarEvent array
 */
export const transformGoogleEventsArray = (
  googleEvents: readonly GoogleCalendarItem[]
): readonly CalendarEvent[] => {
  if (!Array.isArray(googleEvents)) {
    throw new Error('Invalid input: expected array of Google Calendar events')
  }

  return transformGoogleEventsResponse({
    kind: 'calendar#events',
    items: [...googleEvents], // Create mutable copy for transformation
    timeZone: 'UTC', // Default timezone
    summary: 'Transformed Events',
    updated: new Date().toISOString(),
  })
}
