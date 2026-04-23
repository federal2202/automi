/**
 * Google Calendar Query Hooks
 * TanStack Query hooks for Google Calendar API operations
 * 
 * @description Functional React Query hooks for calendar data management
 * @author Frontend Agent 1
 * @version 1.0.0
 */

import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  QueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query'
import {
  calendarService,
  EventsQueryParams
} from '@/services/calendar.service'
import {
  GoogleCalendarListItem,
  GoogleCalendarItem,
  CalendarServiceError,
  CalendarSyncOptions
} from '@/types/google-calendar.types'
import { CalendarEvent } from '@/types/calendar/calendar.types'
import { 
  transformGoogleEventsArray,
  transformCalendarEventToGoogle 
} from '@/utils/calendar/calendar-transform.utils'

/**
 * Query key factory for Google Calendar queries
 * Provides consistent, type-safe query keys for caching
 */
export const googleCalendarQueryKeys = {
  /** Root key for all calendar queries */
  all: ['google-calendar'] as const,
  
  /** Keys for calendar list queries */
  calendars: () => [...googleCalendarQueryKeys.all, 'calendars'] as const,
  calendarsList: (maxResults?: number) => 
    [...googleCalendarQueryKeys.calendars(), { maxResults }] as const,
  
  /** Keys for events queries */
  events: () => [...googleCalendarQueryKeys.all, 'events'] as const,
  eventsForCalendar: (params: EventsQueryParams) => 
    [...googleCalendarQueryKeys.events(), params] as const,
  
  /** Keys for sync operations */
  sync: () => [...googleCalendarQueryKeys.all, 'sync'] as const,
  syncWithOptions: (options: CalendarSyncOptions) =>
    [...googleCalendarQueryKeys.sync(), options] as const
} as const

/**
 * Default query options for calendar operations
 */
const DEFAULT_QUERY_OPTIONS = {
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 30,   // 30 minutes (formerly cacheTime)
  retry: 2,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000)
} as const

/**
 * Hook to fetch user's Google Calendar list
 * 
 * @param maxResults - Maximum number of calendars to fetch (default: 250)
 * @param options - Additional TanStack Query options
 * @returns Query result with calendar list data
 */
export const useGoogleCalendars = (
  maxResults?: number,
  options?: Partial<UseQueryOptions<readonly GoogleCalendarListItem[], CalendarServiceError>>
) => {
  return useQuery({
    queryKey: googleCalendarQueryKeys.calendarsList(maxResults),
    queryFn: () => calendarService.getCalendars(maxResults),
    ...DEFAULT_QUERY_OPTIONS,
    ...options
  })
}

/**
 * Hook to fetch events from a specific Google Calendar
 * 
 * @param params - Query parameters for events request
 * @param options - Additional TanStack Query options
 * @returns Query result with events data (as internal CalendarEvent objects)
 */
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
    ...options
  })
}

/**
 * Hook to fetch raw Google Calendar events (without transformation)
 * Useful when you need the original Google Calendar format
 * 
 * @param params - Query parameters for events request
 * @param options - Additional TanStack Query options
 * @returns Query result with raw Google Calendar events
 */
export const useRawGoogleCalendarEvents = (
  params: EventsQueryParams,
  options?: Partial<UseQueryOptions<readonly GoogleCalendarItem[], CalendarServiceError>>
) => {
  return useQuery({
    queryKey: [...googleCalendarQueryKeys.eventsForCalendar(params), 'raw'],
    queryFn: () => calendarService.getEvents(params),
    enabled: !!params.calendarId,
    ...DEFAULT_QUERY_OPTIONS,
    ...options
  })
}

/**
 * Hook to sync multiple calendars with specified options
 * 
 * @param options - Sync configuration options
 * @param queryOptions - Additional TanStack Query options
 * @returns Query result with all synced events (as internal CalendarEvent objects)
 */
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
    ...queryOptions
  })
}

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
    onSuccess: (_, { calendarId }) => {
      // Invalidate related queries to refresh data
      void queryClient.invalidateQueries({
        queryKey: googleCalendarQueryKeys.events()
      })
      void queryClient.invalidateQueries({
        queryKey: googleCalendarQueryKeys.eventsForCalendar({ calendarId })
      })
      void queryClient.invalidateQueries({
        queryKey: googleCalendarQueryKeys.sync()
      })
    },
    ...options
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
      const googleEventData = updates.title || updates.description || updates.start || updates.end
        ? transformCalendarEventToGoogle(
            { 
              title: updates.title || 'Updated Event',
              start: updates.start || new Date(),
              end: updates.end || new Date(),
              type: updates.type || 'primary',
              description: updates.description
            }, 
            calendarId
          )
        : {}
      
      return calendarService.updateEvent(calendarId, eventId, googleEventData)
    },
    onSuccess: (_, { calendarId }) => {
      // Invalidate related queries to refresh data
      void queryClient.invalidateQueries({
        queryKey: googleCalendarQueryKeys.events()
      })
      void queryClient.invalidateQueries({
        queryKey: googleCalendarQueryKeys.eventsForCalendar({ calendarId })
      })
      void queryClient.invalidateQueries({
        queryKey: googleCalendarQueryKeys.sync()
      })
    },
    ...options
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
    onSuccess: (_, { calendarId }) => {
      // Invalidate related queries to refresh data
      void queryClient.invalidateQueries({
        queryKey: googleCalendarQueryKeys.events()
      })
      void queryClient.invalidateQueries({
        queryKey: googleCalendarQueryKeys.eventsForCalendar({ calendarId })
      })
      void queryClient.invalidateQueries({
        queryKey: googleCalendarQueryKeys.sync()
      })
    },
    ...options
  })
}

/**
 * Utility function to invalidate all Google Calendar queries
 * Useful for manual cache invalidation
 * 
 * @param queryClient - TanStack Query client instance
 */
export const invalidateAllGoogleCalendarQueries = (queryClient: QueryClient): void => {
  void queryClient.invalidateQueries({
    queryKey: googleCalendarQueryKeys.all
  })
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
    ...DEFAULT_QUERY_OPTIONS
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
    ...DEFAULT_QUERY_OPTIONS
  })
}

/**
 * Google Calendar hooks collection
 * Groups all hooks for easy destructuring import
 */
export const googleCalendarHooks = {
  // Query hooks
  useGoogleCalendars,
  useGoogleCalendarEvents,
  useRawGoogleCalendarEvents,
  useGoogleCalendarSync,
  
  // Mutation hooks
  useCreateGoogleCalendarEvent,
  useUpdateGoogleCalendarEvent,
  useDeleteGoogleCalendarEvent,
  
  // Utility functions
  invalidateAllGoogleCalendarQueries,
  prefetchGoogleCalendars,
  prefetchGoogleCalendarEvents
} as const