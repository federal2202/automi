/**
 * Google Calendar DateTime & people-related types
 *
 * @see https://developers.google.com/calendar/api/v3/reference
 */

/**
 * Google Calendar DateTime object
 * Represents a date-time value for calendar events
 */
export interface GoogleCalendarDateTime {
  /** RFC3339 timestamp with timezone information */
  dateTime?: string
  /** Date in YYYY-MM-DD format for all-day events */
  date?: string
  /** Time zone identifier (e.g., 'America/New_York') */
  timeZone?: string
}

/**
 * Google Calendar Event Attendee
 */
export interface GoogleCalendarAttendee {
  /** Attendee's email address */
  email: string
  /** Attendee's display name */
  displayName?: string
  /** Response status */
  responseStatus: 'needsAction' | 'declined' | 'tentative' | 'accepted'
  /** Whether this attendee is optional */
  optional?: boolean
  /** Whether this attendee is the organizer */
  organizer?: boolean
}

/**
 * Google Calendar Event Creator/Organizer
 */
export interface GoogleCalendarPerson {
  /** Email address */
  email: string
  /** Display name */
  displayName?: string
  /** Whether this person is the current user */
  self?: boolean
}
