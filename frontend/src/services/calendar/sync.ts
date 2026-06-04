/**
 * Calendar sync operations
 */

import { GoogleCalendarItem, CalendarSyncOptions } from '@/types/google-calendar.types'
import { getCalendars } from './calendars'
import { getEvents } from './events'
import { handleCalendarServiceError } from './errors'

/**
 * Syncs multiple calendars with specified options
 *
 * @param options - Sync configuration options
 * @returns Promise resolving to array of all synced events
 * @throws CalendarServiceError on API failure
 */
export const syncCalendars = async (
  options: CalendarSyncOptions
): Promise<readonly GoogleCalendarItem[]> => {
  try {
    // If no calendar IDs specified, get all calendars first
    const calendarIds = options.calendarIds ?? (await getCalendars()).map(cal => cal.id)

    // Fetch events from all calendars in parallel
    const eventPromises = calendarIds.map(calendarId =>
      getEvents({
        calendarId,
        timeMin: options.timeMin,
        timeMax: options.timeMax,
        maxResults: options.maxResults,
        singleEvents: options.singleEvents,
        orderBy: options.orderBy,
        showDeleted: options.showDeleted
      })
    )

    const eventArrays = await Promise.all(eventPromises)

    // Flatten and return all events
    return eventArrays.flat()
  } catch (error) {
    throw handleCalendarServiceError(error)
  }
}
