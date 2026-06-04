'use client'

import { useEffect, useMemo } from 'react'
import { useCalendarState, useCalendarActions } from '@/stores/calendarHooks'
import { useGoogleCalendarEvents } from '@/hooks/calendar/useGoogleCalendar'
import { getCalendarDateRange } from '@/utils/calendar/calendar-transform.utils'

interface GoogleCalendarProviderProps {
  children: React.ReactNode
}

/**
 * Google Calendar Provider Component
 * Integrates Google Calendar data with the existing calendar UI
 * Manages the connection between TanStack Query and Zustand store
 */
export function GoogleCalendarProvider({ children }: GoogleCalendarProviderProps) {
  const { currentDate, view, selectedCalendarId } = useCalendarState()
  const { setLoading, setError } = useCalendarActions()

  // Calculate date range for current view
  const { timeMin, timeMax } = useMemo(() => 
    getCalendarDateRange(currentDate, view), 
    [currentDate, view]
  )

  // Fetch Google Calendar events for current date range
  const {
    isLoading,
    error,
    refetch
  } = useGoogleCalendarEvents({
    calendarId: selectedCalendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    maxResults: 1000,
    singleEvents: true,
    orderBy: 'startTime'
  })

  // Update store loading state when query state changes
  useEffect(() => {
    setLoading(isLoading)
  }, [isLoading, setLoading])

  // Update store error state when query error changes
  useEffect(() => {
    if (error) {
      // Convert CalendarServiceError to CalendarApiError
      const apiError = {
        message: error.message,
        type: error.type,
        details: error.originalError ? { originalError: error.originalError } : undefined
      }
      setError(apiError)
    } else {
      setError(null)
    }
  }, [error, setError])

  // Force refetch when date range or calendar changes
  useEffect(() => {
    refetch()
  }, [timeMin, timeMax, selectedCalendarId, refetch])

  return <>{children}</>
}