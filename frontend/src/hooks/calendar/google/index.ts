/**
 * Google Calendar hooks — public barrel
 *
 * Aggregates the per-concern modules (query keys, queries, mutations, cache
 * utilities) into a single import surface for consumers.
 */

import {
  useGoogleCalendars,
  useGoogleCalendarEvents,
  useRawGoogleCalendarEvents,
  useGoogleCalendarSync,
} from './queries'
import {
  useCreateGoogleCalendarEvent,
  useUpdateGoogleCalendarEvent,
  useDeleteGoogleCalendarEvent,
} from './mutations'
import {
  invalidateAllGoogleCalendarQueries,
  prefetchGoogleCalendars,
  prefetchGoogleCalendarEvents,
} from './utils'

export { googleCalendarQueryKeys, DEFAULT_QUERY_OPTIONS } from './queryKeys'
export * from './queries'
export * from './mutations'
export * from './utils'

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
  prefetchGoogleCalendarEvents,
} as const
