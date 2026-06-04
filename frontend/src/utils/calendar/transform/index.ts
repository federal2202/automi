/**
 * Calendar Transform Utilities — public barrel
 *
 * Pure transformation functions for Google Calendar data, grouped by concern:
 * validation (type guards), parsing/classification, event transforms, ranges.
 */

import {
  transformGoogleEventToCalendarEvent,
  transformGoogleEventsResponse,
  transformGoogleEventsArray,
} from './from-google'
import { transformCalendarEventToGoogle } from './to-google'
import {
  isValidGoogleEvent,
  isValidGoogleCalendarDateTime,
  isValidGoogleCalendarListItem,
} from './validation'
import { parseGoogleDateTime, determineEventType, sanitizeEventTitle } from './parsing'
import { getCalendarDateRange } from './range'

export * from './validation'
export * from './parsing'
export * from './from-google'
export * from './to-google'
export * from './range'

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
  getCalendarDateRange,
} as const
