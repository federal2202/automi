/**
 * Calendar list endpoints
 */

import { api } from '@/api/axios'
import {
  GoogleCalendarListItem,
  GoogleCalendarListResponse
} from '@/types/google-calendar.types'
import { handleCalendarServiceError } from './errors'

/**
 * Fetches user's calendar list from Google Calendar API
 *
 * @param maxResults - Maximum number of calendars to retrieve (default: 250)
 * @param pageToken - Token for paginated results
 * @returns Promise resolving to array of calendar list items
 * @throws CalendarServiceError on API failure
 */
export const getCalendars = async (
  maxResults: number = 250,
  pageToken?: string
): Promise<readonly GoogleCalendarListItem[]> => {
  try {
    const params: Record<string, string | number> = {
      maxResults
    }

    if (pageToken) {
      params.pageToken = pageToken
    }

    const response = await api.get<GoogleCalendarListResponse>('/calendar/calendars', {
      params
    })

    return response.data.items
  } catch (error) {
    throw handleCalendarServiceError(error)
  }
}
