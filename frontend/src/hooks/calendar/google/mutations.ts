/**
 * Google Calendar mutation hooks
 * TanStack Query hooks for creating, updating and deleting events
 */

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query'
import { calendarService } from '@/services/calendar.service'
import { GoogleCalendarItem, CalendarServiceError } from '@/types/google-calendar.types'
import { CalendarEvent } from '@/types/calendar/calendar.types'
import { transformCalendarEventToGoogle } from '@/utils/calendar/calendar-transform.utils'
import { invalidateEventQueries } from './utils'

/**
 * Mutation hook for creating a new Google Calendar event
 *
 * @param options - Additional mutation options
 * @returns Mutation object for creating events
 */
export const useCreateGoogleCalendarEvent = (
  options?: UseMutationOptions<
    GoogleCalendarItem,
    CalendarServiceError,
    { calendarId: string; event: Omit<CalendarEvent, 'id'> }
  >
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ calendarId, event }) => {
      const googleEventData = transformCalendarEventToGoogle(event, calendarId)
      return calendarService.createEvent(calendarId, googleEventData)
    },
    onSuccess: (_, { calendarId }) => invalidateEventQueries(queryClient, calendarId),
    ...options,
  })
}

/**
 * Mutation hook for updating an existing Google Calendar event
 *
 * @param options - Additional mutation options
 * @returns Mutation object for updating events
 */
export const useUpdateGoogleCalendarEvent = (
  options?: UseMutationOptions<
    GoogleCalendarItem,
    CalendarServiceError,
    { calendarId: string; eventId: string; updates: Partial<CalendarEvent> }
  >
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ calendarId, eventId, updates }) => {
      const hasChanges =
        updates.title || updates.description || updates.start || updates.end
      const googleEventData = hasChanges
        ? transformCalendarEventToGoogle(
            {
              title: updates.title || 'Updated Event',
              start: updates.start || new Date(),
              end: updates.end || new Date(),
              type: updates.type || 'primary',
              description: updates.description,
            },
            calendarId
          )
        : {}

      return calendarService.updateEvent(calendarId, eventId, googleEventData)
    },
    onSuccess: (_, { calendarId }) => invalidateEventQueries(queryClient, calendarId),
    ...options,
  })
}

/**
 * Mutation hook for deleting a Google Calendar event
 *
 * @param options - Additional mutation options
 * @returns Mutation object for deleting events
 */
export const useDeleteGoogleCalendarEvent = (
  options?: UseMutationOptions<
    void,
    CalendarServiceError,
    { calendarId: string; eventId: string }
  >
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ calendarId, eventId }) =>
      calendarService.deleteEvent(calendarId, eventId),
    onSuccess: (_, { calendarId }) => invalidateEventQueries(queryClient, calendarId),
    ...options,
  })
}
