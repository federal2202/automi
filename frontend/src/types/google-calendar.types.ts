/**
 * Google Calendar API Types
 * Comprehensive TypeScript interfaces for Google Calendar API responses
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

/**
 * Google Calendar Event Recurrence Rule
 */
export interface GoogleCalendarRecurrence {
  /** Array of RRULE strings */
  rrule: string[]
  /** Array of RDATE strings */
  rdate?: string[]
  /** Array of EXDATE strings */
  exdate?: string[]
}

/**
 * Google Calendar Event Extended Properties
 */
export interface GoogleCalendarExtendedProperties {
  /** Private properties */
  private?: Record<string, string>
  /** Shared properties */
  shared?: Record<string, string>
}

/**
 * Google Calendar Event Conference Data
 */
export interface GoogleCalendarConferenceData {
  /** Conference solution type */
  conferenceSolution: {
    key: {
      type: string
    }
    name: string
    iconUri?: string
  }
  /** Conference ID */
  conferenceId: string
  /** Entry points for the conference */
  entryPoints: Array<{
    entryPointType: 'video' | 'phone' | 'sip' | 'more'
    uri: string
    label?: string
    pin?: string
    accessCode?: string
  }>
}

/**
 * Google Calendar Event Item
 * Represents a single event from the Google Calendar API
 */
export interface GoogleCalendarItem {
  /** Event identifier */
  id: string
  /** Event title/summary */
  summary: string
  /** Event description */
  description?: string
  /** Event location */
  location?: string
  /** Event start time */
  start: GoogleCalendarDateTime
  /** Event end time */
  end: GoogleCalendarDateTime
  /** Event color ID (1-11) */
  colorId?: string
  /** Event status */
  status: 'confirmed' | 'tentative' | 'cancelled'
  /** Event visibility */
  visibility?: 'default' | 'public' | 'private' | 'confidential'
  /** Event attendees */
  attendees?: GoogleCalendarAttendee[]
  /** Event creator */
  creator?: GoogleCalendarPerson
  /** Event organizer */
  organizer?: GoogleCalendarPerson
  /** Recurrence rules */
  recurrence?: string[]
  /** Original start time for recurring events */
  originalStartTime?: GoogleCalendarDateTime
  /** Extended properties */
  extendedProperties?: GoogleCalendarExtendedProperties
  /** Conference data */
  conferenceData?: GoogleCalendarConferenceData
  /** Creation time */
  created: string
  /** Last update time */
  updated: string
  /** Event URL */
  htmlLink: string
  /** Whether event blocks time on calendar */
  transparency?: 'opaque' | 'transparent'
  /** Event type */
  eventType?: 'default' | 'outOfOffice' | 'focusTime' | 'workingLocation'
}

/**
 * Google Calendar Events List Response
 * Response from the events.list API endpoint
 */
export interface GoogleEventsResponse {
  /** Resource type identifier */
  kind: 'calendar#events'
  /** List of events */
  items: GoogleCalendarItem[]
  /** Token for next page of results */
  nextPageToken?: string
  /** Token for previous page of results */
  prevPageToken?: string
  /** Default time zone for the calendar */
  timeZone: string
  /** Summary of the calendar */
  summary: string
  /** Description of the calendar */
  description?: string
  /** Last update time */
  updated: string
}

/**
 * Google Calendar List Item
 * Represents a single calendar in the user's calendar list
 */
export interface GoogleCalendarListItem {
  /** Calendar identifier */
  id: string
  /** Calendar title */
  summary: string
  /** Calendar description */
  description?: string
  /** Calendar location */
  location?: string
  /** Calendar time zone */
  timeZone: string
  /** Background color hex code */
  backgroundColor?: string
  /** Foreground color hex code */
  foregroundColor?: string
  /** Color ID */
  colorId?: string
  /** Whether this is the user's primary calendar */
  primary?: boolean
  /** User's access role for this calendar */
  accessRole: 'owner' | 'reader' | 'writer' | 'freeBusyReader'
  /** Whether calendar is selected in UI */
  selected?: boolean
  /** Summary override */
  summaryOverride?: string
  /** Notification settings */
  defaultReminders?: Array<{
    method: 'email' | 'popup'
    minutes: number
  }>
  /** Conference properties */
  conferenceProperties?: {
    allowedConferenceSolutionTypes: string[]
  }
}

/**
 * Google Calendar List Response
 * Response from the calendarList.list API endpoint
 */
export interface GoogleCalendarListResponse {
  /** Resource type identifier */
  kind: 'calendar#calendarList'
  /** List of calendars */
  items: GoogleCalendarListItem[]
  /** Token for next page of results */
  nextPageToken?: string
}

/**
 * Google Calendar API Error Response
 */
export interface GoogleCalendarError {
  /** Error details */
  error: {
    /** HTTP status code */
    code: number
    /** Error message */
    message: string
    /** Error domain */
    domain?: string
    /** Error reason */
    reason?: string
    /** Additional error details */
    details?: Array<{
      '@type': string
      fieldViolations?: Array<{
        field: string
        description: string
      }>
    }>
  }
}

/**
 * Calendar Service Error Types
 * Custom error types for calendar service operations
 */
export interface CalendarServiceError {
  /** Error type identifier */
  type: 'NETWORK_ERROR' | 'AUTH_ERROR' | 'VALIDATION_ERROR' | 'GOOGLE_API_ERROR' | 'UNKNOWN_ERROR'
  /** Human-readable error message */
  message: string
  /** Original error object */
  originalError?: unknown
  /** Google API error details */
  googleError?: GoogleCalendarError
  /** HTTP status code if applicable */
  statusCode?: number
}

/**
 * Calendar Sync Options
 * Configuration options for calendar synchronization
 */
export interface CalendarSyncOptions {
  /** Calendar IDs to sync */
  calendarIds?: string[]
  /** Date range for sync */
  timeMin?: string
  /** Date range for sync */
  timeMax?: string
  /** Maximum number of events to retrieve */
  maxResults?: number
  /** Whether to include deleted events */
  showDeleted?: boolean
  /** Single events vs recurring instances */
  singleEvents?: boolean
  /** Order by */
  orderBy?: 'startTime' | 'updated'
}

/**
 * Calendar Authorization Scopes
 * Google Calendar API scopes for OAuth
 */
export type GoogleCalendarScope = 
  | 'https://www.googleapis.com/auth/calendar'
  | 'https://www.googleapis.com/auth/calendar.readonly'
  | 'https://www.googleapis.com/auth/calendar.events'
  | 'https://www.googleapis.com/auth/calendar.events.readonly'