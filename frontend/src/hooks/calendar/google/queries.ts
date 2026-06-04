/**
 * Google Calendar query hooks
 * TanStack Query hooks for reading calendars and events
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { calendarService, EventsQueryParams } from '@/services/calendar.service'
import {
  GoogleCalendarListItem,
  GoogleCalendarItem,
  CalendarServiceError,
  CalendarSyncOptions,
} from '@/types/google-calendar.types'
import { CalendarEvent } from '@/types/calendar/calendar.types'
import { transformGoogleEventsArray } from '@/utils/calendar/calendar-transform.utils'
import { googleCalendarQueryKeys, DEFAULT_QUERY_OPTIONS } from './queryKeys'

/** Fetch the user's Google Calendar list */
export const useGoogleCalendars = (
  maxResults?: number,
  options?: Partial<UseQueryOptions<readonly GoogleCalendarListItem[], CalendarServiceError>>
) => {
  return useQuery({
    queryKey: googleCalendarQueryKeys.calendarsList(maxResults),
    queryFn: () => calendarService.getCalendars(maxResults),
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
  })
}

/** Fetch events from a calendar, transformed to internal CalendarEvent objects */
export const useGoogleCalendarEvents = (
  params: EventsQueryParams,
  options?: Partial<UseQueryOptions<readonly CalendarEvent[], CalendarServiceError>>
) => {
  return useQuery({
    queryKey: googleCalendarQueryKeys.eventsForCalendar(params),
    queryFn: async () => {
      const googleEvents = await calendarService.getEvents(params)
      return transformGoogleEventsArray(googleEvents)
    },
    enabled: !!params.calendarId,
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
  })
}

/** Fetch raw Google Calendar events (original Google format, no transformation) */
export const useRawGoogleCalendarEvents = (
  params: EventsQueryParams,
  options?: Partial<UseQueryOptions<readonly GoogleCalendarItem[], CalendarServiceError>>
) => {
  return useQuery({
    queryKey: [...googleCalendarQueryKeys.eventsForCalendar(params), 'raw'],
    queryFn: () => calendarService.getEvents(params),
    enabled: !!params.calendarId,
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
  })
}

/** Sync multiple calendars and return all events as internal CalendarEvent objects */
export const useGoogleCalendarSync = (
  options: CalendarSyncOptions,
  queryOptions?: Partial<UseQueryOptions<readonly CalendarEvent[], CalendarServiceError>>
) => {
  return useQuery({
    queryKey: googleCalendarQueryKeys.syncWithOptions(options),
    queryFn: async () => {
      const googleEvents = await calendarService.syncCalendars(options)
      return transformGoogleEventsArray(googleEvents)
    },
    ...DEFAULT_QUERY_OPTIONS,
    staleTime: 1000 * 60 * 2, // Sync data is more volatile, shorter stale time
    ...queryOptions,
  })
}
