/**
 * Google Calendar Event item & events list response
 *
 * @see https://developers.google.com/calendar/api/v3/reference
 */

import { GoogleCalendarDateTime, GoogleCalendarAttendee, GoogleCalendarPerson } from './datetime.types'
import {
  GoogleCalendarExtendedProperties,
  GoogleCalendarConferenceData,
} from './event-details.types'

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
