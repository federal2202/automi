/**
 * Google Calendar cache utilities
 * Imperative helpers for invalidating and prefetching calendar queries
 */

import { QueryClient } from '@tanstack/react-query'
import { calendarService, EventsQueryParams } from '@/services/calendar.service'
import { transformGoogleEventsArray } from '@/utils/calendar/calendar-transform.utils'
import { googleCalendarQueryKeys, DEFAULT_QUERY_OPTIONS } from './queryKeys'

/**
 * Invalidate the event-related queries affected by a mutation
 *
 * @param queryClient - TanStack Query client instance
 * @param calendarId - Calendar whose events changed
 */
export const invalidateEventQueries = (
  queryClient: QueryClient,
  calendarId: string
): void => {
  void queryClient.invalidateQueries({ queryKey: googleCalendarQueryKeys.events() })
  void queryClient.invalidateQueries({
    queryKey: googleCalendarQueryKeys.eventsForCalendar({ calendarId }),
  })
  void queryClient.invalidateQueries({ queryKey: googleCalendarQueryKeys.sync() })
}

/**
 * Utility function to invalidate all Google Calendar queries
 * Useful for manual cache invalidation
 *
 * @param queryClient - TanStack Query client instance
 */
export const invalidateAllGoogleCalendarQueries = (queryClient: QueryClient): void => {
  void queryClient.invalidateQueries({ queryKey: googleCalendarQueryKeys.all })
}

/**
 * Utility function to prefetch calendar list
 * Useful for optimistic loading scenarios
 *
 * @param queryClient - TanStack Query client instance
 * @param maxResults - Maximum calendars to prefetch
 */
export const prefetchGoogleCalendars = async (
  queryClient: QueryClient,
  maxResults?: number
): Promise<void> => {
  await queryClient.prefetchQuery({
    queryKey: googleCalendarQueryKeys.calendarsList(maxResults),
    queryFn: () => calendarService.getCalendars(maxResults),
    ...DEFAULT_QUERY_OPTIONS,
  })
}

/**
 * Utility function to prefetch calendar events
 * Useful for optimistic loading scenarios
 *
 * @param queryClient - TanStack Query client instance
 * @param params - Query parameters for events
 */
export const prefetchGoogleCalendarEvents = async (
  queryClient: QueryClient,
  params: EventsQueryParams
): Promise<void> => {
  if (!params.calendarId) return

  await queryClient.prefetchQuery({
    queryKey: googleCalendarQueryKeys.eventsForCalendar(params),
    queryFn: async () => {
      const googleEvents = await calendarService.getEvents(params)
      return transformGoogleEventsArray(googleEvents)
    },
    ...DEFAULT_QUERY_OPTIONS,
  })
}
