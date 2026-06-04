/**
 * Calendar events read endpoint
 */

import { api } from '@/api/axios'
import { GoogleCalendarItem, GoogleEventsResponse } from '@/types/google-calendar.types'
import { EventsQueryParams } from './params'
import { handleCalendarServiceError } from './errors'

/**
 * Fetches events from a specific calendar
 *
 * @param params - Query parameters for events request
 * @returns Promise resolving to array of calendar events
 * @throws CalendarServiceError on API failure
 */
export const getEvents = async (
  params: EventsQueryParams
): Promise<readonly GoogleCalendarItem[]> => {
  try {
    const queryParams: Record<string, string | number | boolean> = {
      calendarId: params.calendarId,
      singleEvents: params.singleEvents ?? true,
      orderBy: params.orderBy ?? 'startTime'
    }

    // Add optional parameters
    if (params.timeMin) queryParams.timeMin = params.timeMin
    if (params.timeMax) queryParams.timeMax = params.timeMax
    if (params.maxResults) queryParams.maxResults = params.maxResults
    if (params.showDeleted) queryParams.showDeleted = params.showDeleted
    if (params.pageToken) queryParams.pageToken = params.pageToken

    const response = await api.get<GoogleEventsResponse>(
      `/calendar/events`,
      { params: queryParams }
    )

    return response.data.items
  } catch (error) {
    throw handleCalendarServiceError(error)
  }
}
