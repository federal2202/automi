/**
 * Type guards for validating Google Calendar API objects.
 */

import {
  GoogleCalendarItem,
  GoogleCalendarDateTime,
  GoogleCalendarListItem,
} from '@/types/google-calendar.types'

/**
 * Type guard to validate Google Calendar DateTime object
 *
 * @param datetime - Object to validate
 * @returns True if object is a valid GoogleCalendarDateTime
 */
export const isValidGoogleCalendarDateTime = (
  datetime: unknown
): datetime is GoogleCalendarDateTime => {
  if (!datetime || typeof datetime !== 'object') return false

  const dt = datetime as Record<string, unknown>

  // Must have either dateTime or date, but not both
  const hasDateTime = typeof dt.dateTime === 'string'
  const hasDate = typeof dt.date === 'string'

  if (!hasDateTime && !hasDate) return false
  if (hasDateTime && hasDate) return false

  // timeZone is optional but must be string if present
  if (dt.timeZone !== undefined && typeof dt.timeZone !== 'string') return false

  return true
}

/**
 * Type guard to validate Google Calendar Event object
 *
 * @param event - Object to validate
 * @returns True if object is a valid GoogleCalendarItem
 */
export const isValidGoogleEvent = (event: unknown): event is GoogleCalendarItem => {
  if (!event || typeof event !== 'object') return false

  const evt = event as Record<string, unknown>

  // Required fields
  if (typeof evt.id !== 'string') return false
  if (typeof evt.summary !== 'string') return false
  if (typeof evt.created !== 'string') return false
  if (typeof evt.updated !== 'string') return false
  if (typeof evt.htmlLink !== 'string') return false

  // Validate start and end times
  if (!isValidGoogleCalendarDateTime(evt.start)) return false
  if (!isValidGoogleCalendarDateTime(evt.end)) return false

  // Validate status
  if (!['confirmed', 'tentative', 'cancelled'].includes(evt.status as string)) return false

  return true
}

/**
 * Type guard for Google Calendar List Item
 *
 * @param item - Object to validate
 * @returns True if object is a valid GoogleCalendarListItem
 */
export const isValidGoogleCalendarListItem = (
  item: unknown
): item is GoogleCalendarListItem => {
  if (!item || typeof item !== 'object') return false

  const cal = item as Record<string, unknown>

  // Required fields
  if (typeof cal.id !== 'string') return false
  if (typeof cal.summary !== 'string') return false
  if (typeof cal.timeZone !== 'string') return false

  // Validate access role
  const validRoles = ['owner', 'reader', 'writer', 'freeBusyReader']
  if (!validRoles.includes(cal.accessRole as string)) return false

  return true
}
