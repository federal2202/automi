/**
 * Parsing and classification helpers for Google Calendar data.
 */

import { GoogleCalendarItem, GoogleCalendarDateTime } from '@/types/google-calendar.types'
import { EventType } from '@/types/calendar/calendar.types'
import { isValidGoogleCalendarDateTime } from './validation'

/**
 * Parses Google Calendar DateTime to JavaScript Date
 *
 * @param datetime - Google Calendar DateTime object
 * @returns JavaScript Date object
 * @throws Error if datetime is invalid
 */
export const parseGoogleDateTime = (datetime: GoogleCalendarDateTime): Date => {
  if (!isValidGoogleCalendarDateTime(datetime)) {
    throw new Error('Invalid Google Calendar DateTime object')
  }

  // Handle all-day events (date only)
  if (datetime.date) {
    const date = new Date(datetime.date + 'T00:00:00')
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: ${datetime.date}`)
    }
    return date
  }

  // Handle timed events (dateTime)
  if (datetime.dateTime) {
    const date = new Date(datetime.dateTime)
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid dateTime format: ${datetime.dateTime}`)
    }
    return date
  }

  throw new Error('No valid date or dateTime found in GoogleCalendarDateTime')
}

/**
 * Determines event type based on Google Calendar event properties
 *
 * @param googleEvent - Google Calendar event object
 * @returns EventType classification
 */
export const determineEventType = (googleEvent: GoogleCalendarItem): EventType => {
  // Check status first
  if (googleEvent.status === 'cancelled') return 'inactive'
  if (googleEvent.status === 'tentative') return 'secondary'

  // Check for special event types
  if (googleEvent.eventType === 'outOfOffice' || googleEvent.eventType === 'focusTime') {
    return 'critical'
  }

  // Check color ID for priority
  const colorId = googleEvent.colorId ? parseInt(googleEvent.colorId, 10) : 0

  // Google Calendar color mapping (approximate priority)
  // High priority colors: red (11), orange (6)
  if ([6, 11].includes(colorId)) return 'critical'

  // Medium priority colors: yellow (5), purple (3)
  if ([3, 5].includes(colorId)) return 'secondary'

  // Default to primary for confirmed events
  return 'primary'
}

/**
 * Validates and sanitizes event title for Google Calendar
 *
 * @param title - Raw event title
 * @returns Sanitized title suitable for Google Calendar
 */
export const sanitizeEventTitle = (title: string): string => {
  if (typeof title !== 'string') {
    throw new Error('Event title must be a string')
  }

  // Trim and ensure non-empty
  const sanitized = title.trim()
  if (sanitized.length === 0) {
    throw new Error('Event title cannot be empty')
  }

  // Google Calendar has a 1024 character limit for summary
  return sanitized.length > 1024 ? sanitized.substring(0, 1024) : sanitized
}
