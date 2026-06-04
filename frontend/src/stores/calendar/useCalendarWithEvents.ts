'use client'

import { CalendarEvent } from '@/types/calendar/calendar.types'

import { useCalendarState } from './useCalendarState'
import { useCalendarUIState } from './useCalendarUIState'
import { useCalendarActions } from './useCalendarActions'

/**
 * Hook that combines Redux UI state with TanStack Query data.
 * @param events - Events from TanStack Query
 * @returns Combined state with selected event
 */
export const useCalendarWithEvents = (events: CalendarEvent[] = []) => {
  const uiState = useCalendarUIState()
  const calendarState = useCalendarState()
  const actions = useCalendarActions()

  const selectedEvent = uiState.selectedEventId
    ? events.find((event) => event.id === uiState.selectedEventId)
    : null

  return {
    // Calendar state
    ...calendarState,

    // UI state
    ...uiState,
    selectedEvent,

    // Events from TanStack Query
    events,

    // Actions
    ...actions,
  }
}
