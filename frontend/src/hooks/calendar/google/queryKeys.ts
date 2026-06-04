/**
 * Query key factory and shared query options for Google Calendar queries
 */

import { EventsQueryParams } from '@/services/calendar.service'
import { CalendarSyncOptions } from '@/types/google-calendar.types'

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
    [...googleCalendarQueryKeys.sync(), options] as const,
} as const

/**
 * Default query options for calendar operations
 */
export const DEFAULT_QUERY_OPTIONS = {
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
  retry: 2,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
} as const
