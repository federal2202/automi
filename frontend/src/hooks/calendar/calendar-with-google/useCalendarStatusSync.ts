'use client'

import { useEffect } from 'react'
import { useCalendarActions } from '@/stores/calendarHooks'
import { CalendarServiceError } from '@/types/google-calendar/errors.types'

interface StatusSyncArgs {
  isEventsLoading: boolean
  isCalendarsLoading: boolean
  eventsError?: CalendarServiceError | null
  calendarsError?: CalendarServiceError | null
}

/**
 * Sync transient Google Calendar loading/error status into the calendar store.
 * Extracted from `useCalendarWithGoogle` so the main hook stays thin.
 */
export function useCalendarStatusSync({
  isEventsLoading,
  isCalendarsLoading,
  eventsError,
  calendarsError
}: StatusSyncArgs) {
  const { setLoading, setError } = useCalendarActions()

  // Update store loading state
  useEffect(() => {
    setLoading(isEventsLoading || isCalendarsLoading)
  }, [isEventsLoading, isCalendarsLoading, setLoading])

  // Update store error state
  useEffect(() => {
    const error = eventsError || calendarsError
    if (error) {
      // Convert CalendarServiceError to CalendarApiError
      const apiError = {
        message: error.message,
        type: error.type,
        details: error.originalError ? { originalError: error.originalError } : undefined
      }
      setError(apiError)
      console.warn('Calendar API Error:', error)
    } else {
      setError(null)
    }
  }, [eventsError, calendarsError, setError])
}
