/**
 * Google Calendar event detail types
 * Recurrence, extended properties, and conference data.
 *
 * @see https://developers.google.com/calendar/api/v3/reference
 */

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
