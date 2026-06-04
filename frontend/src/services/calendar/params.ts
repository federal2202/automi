/**
 * Calendar service request params
 */

/**
 * Query parameters for events endpoint
 */
export interface EventsQueryParams {
  readonly calendarId: string
  readonly timeMin?: string
  readonly timeMax?: string
  readonly maxResults?: number
  readonly singleEvents?: boolean
  readonly orderBy?: 'startTime' | 'updated'
  readonly showDeleted?: boolean
  readonly pageToken?: string
}
