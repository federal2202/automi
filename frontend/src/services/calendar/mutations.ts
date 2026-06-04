/**
 * Calendar event mutation endpoints (create / update / delete)
 */

import { api } from '@/api/axios'
import { GoogleCalendarItem } from '@/types/google-calendar.types'
import { handleCalendarServiceError } from './errors'

/**
 * Creates a new event in the specified calendar
 *
 * @param calendarId - ID of the calendar to create event in
 * @param eventData - Event data to create
 * @returns Promise resolving to created event
 * @throws CalendarServiceError on API failure
 */
export const createEvent = async (
  calendarId: string,
  eventData: Partial<GoogleCalendarItem>
): Promise<GoogleCalendarItem> => {
  try {
    const response = await api.post<GoogleCalendarItem>(
      '/calendar/events',
      {
        calendarId,
        ...eventData
      }
    )

    return response.data
  } catch (error) {
    throw handleCalendarServiceError(error)
  }
}

/**
 * Updates an existing event in the specified calendar
 *
 * @param calendarId - ID of the calendar containing the event
 * @param eventId - ID of the event to update
 * @param eventData - Updated event data
 * @returns Promise resolving to updated event
 * @throws CalendarServiceError on API failure
 */
export const updateEvent = async (
  calendarId: string,
  eventId: string,
  eventData: Partial<GoogleCalendarItem>
): Promise<GoogleCalendarItem> => {
  try {
    const response = await api.put<GoogleCalendarItem>(
      `/calendar/events/${eventId}`,
      {
        calendarId,
        ...eventData
      }
    )

    return response.data
  } catch (error) {
    throw handleCalendarServiceError(error)
  }
}

/**
 * Deletes an event from the specified calendar
 *
 * @param calendarId - ID of the calendar containing the event
 * @param eventId - ID of the event to delete
 * @returns Promise resolving when deletion is complete
 * @throws CalendarServiceError on API failure
 */
export const deleteEvent = async (
  calendarId: string,
  eventId: string
): Promise<void> => {
  try {
    await api.delete(`/calendar/events/${eventId}`, {
      params: { calendarId }
    })
  } catch (error) {
    throw handleCalendarServiceError(error)
  }
}
