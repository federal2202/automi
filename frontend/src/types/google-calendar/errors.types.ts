/**
 * Google Calendar API & service error types
 *
 * @see https://developers.google.com/calendar/api/v3/reference
 */

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
