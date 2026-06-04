/**
 * Calendar sync options & OAuth scopes
 *
 * @see https://developers.google.com/calendar/api/v3/reference
 */

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
