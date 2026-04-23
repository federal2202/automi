'use client'

import { useMemo, useEffect } from 'react'
import { useCalendarState, useCalendarActions } from '@/stores/calendarStore'
import { useGoogleCalendarEvents, useGoogleCalendars } from '@/hooks/calendar/useGoogleCalendar'
import { useEventGeneration } from '@/hooks/calendar/useEventGeneration'
import { getCalendarDateRange } from '@/utils/calendar/calendar-transform.utils'
import { CalendarEvent } from '@/types/calendar/calendar.types'

/**
 * Combined Calendar Hook
 * Integrates Google Calendar data with existing calendar functionality
 * Falls back to sample data when Google Calendar is unavailable
 */
export function useCalendarWithGoogle() {
  const { currentDate, view, selectedCalendarId } = useCalendarState()
  const { setLoading, setError } = useCalendarActions()
  
  // Generate sample events as fallback
  const sampleEvents = useEventGeneration()

  // Calculate date range for current view
  const { timeMin, timeMax } = useMemo(() => 
    getCalendarDateRange(currentDate, view), 
    [currentDate, view]
  )

  // Fetch Google Calendar events
  const {
    data: googleEvents = [],
    isLoading: isEventsLoading,
    error: eventsError,
    refetch: refetchEvents
  } = useGoogleCalendarEvents({
    calendarId: selectedCalendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    maxResults: 1000,
    singleEvents: true,
    orderBy: 'startTime'
  }, {
    enabled: !!selectedCalendarId, // Only fetch if calendar ID exists
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2
  })

  // Fetch available calendars
  const {
    data: calendars = [],
    isLoading: isCalendarsLoading,
    error: calendarsError
  } = useGoogleCalendars(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  })

  // Determine which events to use
  const events: CalendarEvent[] = useMemo(() => {
    // If Google Calendar data is available and not in error state, use it
    if (googleEvents.length > 0 && !eventsError) {
      return [...googleEvents] // Convert readonly to mutable
    }
    
    // Fall back to sample events if Google Calendar is unavailable
    return sampleEvents
  }, [googleEvents, eventsError, sampleEvents])

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

  // Determine if we're using Google Calendar or sample data
  const isUsingGoogleCalendar = useMemo(() => {
    return googleEvents.length > 0 && !eventsError
  }, [googleEvents, eventsError])

  return {
    // Event data
    events,
    calendars,
    
    // Loading states
    isEventsLoading,
    isCalendarsLoading,
    isLoading: isEventsLoading || isCalendarsLoading,
    
    // Error states
    eventsError,
    calendarsError,
    error: eventsError || calendarsError,
    
    // Status indicators
    isUsingGoogleCalendar,
    hasGoogleCalendars: calendars.length > 0,
    
    // Refetch function for manual refresh
    refetch: refetchEvents,
    
    // Calendar state
    currentDate,
    view,
    selectedCalendarId
  }
}