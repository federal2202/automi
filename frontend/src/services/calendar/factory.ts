/**
 * Calendar service factory & default instance
 */

import { getCalendars } from './calendars'
import { getEvents } from './events'
import { createEvent, updateEvent, deleteEvent } from './mutations'
import { syncCalendars } from './sync'
import { handleCalendarServiceError } from './errors'

/**
 * Calendar service factory function
 * Creates an object containing all calendar service functions
 *
 * @returns Object with calendar service methods
 */
export const createCalendarService = () => ({
  getCalendars,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  syncCalendars,
  handleError: handleCalendarServiceError
} as const)

/**
 * Default calendar service instance
 * Pre-configured service object for immediate use
 */
export const calendarService = createCalendarService()
