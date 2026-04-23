/**
 * Calendar Transform Utilities
 * Pure transformation functions for Google Calendar data
 * 
 * @description Functions to transform Google Calendar API responses to internal calendar types
 * @author Frontend Agent 1
 * @version 1.0.0
 */

import {
  GoogleCalendarItem,
  GoogleEventsResponse,
  GoogleCalendarDateTime,
  GoogleCalendarListItem
} from '@/types/google-calendar.types'
import { CalendarEvent, EventType } from '@/types/calendar/calendar.types'

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
      description: googleEvent.description || undefined
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
      const transformedEvent = transformGoogleEventToCalendarEvent(item)
      transformedEvents.push(transformedEvent)
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
 * 
 * @param googleEvents - Array of Google Calendar event objects
 * @returns Array of transformed CalendarEvent objects
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
    updated: new Date().toISOString()
  })
}

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
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }
  
  const end: GoogleCalendarDateTime = {
    dateTime: calendarEvent.end.toISOString(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }
  
  // Map event type to color ID (approximate)
  const colorIdMap: Record<EventType, string> = {
    primary: '1', // Blue
    secondary: '5', // Yellow
    critical: '11', // Red
    inactive: '8' // Gray
  }
  
  return {
    summary: calendarEvent.title,
    description: calendarEvent.description,
    start,
    end,
    colorId: colorIdMap[calendarEvent.type],
    status: 'confirmed'
  }
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

/**
 * Gets the appropriate date range for calendar API queries based on current view
 * 
 * @param currentDate - The current date being displayed
 * @param view - The current calendar view (month, week, day, etc.)
 * @returns Object with timeMin and timeMax dates for API queries
 */
export const getCalendarDateRange = (currentDate: Date, view: string) => {
  const start = new Date(currentDate)
  const end = new Date(currentDate)
  
  // Reset to start of day
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  
  switch (view) {
    case 'month':
      // Start from first day of month, end at last day of month
      start.setDate(1)
      end.setMonth(end.getMonth() + 1, 0)
      break
      
    case 'week':
      // Start from Sunday of current week, end at Saturday
      const dayOfWeek = start.getDay()
      start.setDate(start.getDate() - dayOfWeek)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      break
      
    case 'day':
      // Single day - start and end are the same day
      end.setDate(end.getDate())
      break
      
    default:
      // Default to month view
      start.setDate(1)
      end.setMonth(end.getMonth() + 1, 0)
  }
  
  return { timeMin: start, timeMax: end }
}

/**
 * Calendar transformation utilities object
 * Groups all transformation functions for easy import
 */
export const calendarTransformUtils = {
  // Core transformations
  transformGoogleEventToCalendarEvent,
  transformGoogleEventsResponse,
  transformGoogleEventsArray,
  transformCalendarEventToGoogle,
  
  // Type guards
  isValidGoogleEvent,
  isValidGoogleCalendarDateTime,
  isValidGoogleCalendarListItem,
  
  // Utility functions
  parseGoogleDateTime,
  determineEventType,
  sanitizeEventTitle,
  getCalendarDateRange
} as const