/**
 * Google Calendar list item & calendar list response
 *
 * @see https://developers.google.com/calendar/api/v3/reference
 */

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
