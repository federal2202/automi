'use client'

/**
 * Calendar composite hooks.
 *
 * Thin wrappers over the Redux `calendar` slice that preserve the EXACT return
 * shapes of the original Zustand-derived hooks in `calendarStore.ts`, so
 * consumers migrate by changing only their import path.
 *
 * `useEventManagement` and `useCalendarWithEvents` mix this Redux UI state with
 * TanStack Query mutations/data — that logic is ported verbatim, only swapping
 * Zustand reads for `useAppSelector` and setters for `dispatch(...)`.
 */
import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { CalendarEvent, NavigationDirection } from '@/types/calendar/calendar.types'
import {
  useCreateGoogleCalendarEvent,
  useUpdateGoogleCalendarEvent,
  useDeleteGoogleCalendarEvent,
  googleCalendarQueryKeys,
} from '@/hooks/calendar/useGoogleCalendar'

import { useAppDispatch, useAppSelector } from './hooks'
import type { CalendarApiError } from './calendarSlice'
import {
  setCurrentDate,
  setView,
  setSelectedCalendar,
  navigateCalendar,
  openCreateModal,
  openEditModal,
  closeModal,
  selectEvent,
  setLoading,
  setError,
} from './calendarSlice'
import type { CalendarView } from '@/types/calendar/calendar.types'

/**
 * Hook to access calendar state (UI state only).
 * Selects primitives individually, then composes.
 */
export const useCalendarState = () => {
  const currentDate = useAppSelector((s) => s.calendar.currentDate)
  const view = useAppSelector((s) => s.calendar.view)
  const selectedCalendarId = useAppSelector((s) => s.calendar.selectedCalendarId)
  return {
    currentDate,
    view,
    selectedCalendarId,
  }
}

/**
 * Hook to access UI state.
 */
export const useCalendarUIState = () => {
  const isEventModalOpen = useAppSelector((s) => s.calendar.isEventModalOpen)
  const selectedEventId = useAppSelector((s) => s.calendar.selectedEventId)
  const selectedSlot = useAppSelector((s) => s.calendar.selectedSlot)
  const isLoading = useAppSelector((s) => s.calendar.isLoading)
  const error = useAppSelector((s) => s.calendar.error)
  return {
    isEventModalOpen,
    isCreateMode: selectedSlot !== null, // Derive create mode from selectedSlot
    selectedEventId,
    selectedSlot,
    isLoading,
    error,
  }
}

/**
 * Hook to access calendar actions (bound action creators).
 */
export const useCalendarActions = () => {
  const dispatch = useAppDispatch()
  return useMemo(
    () => ({
      setCurrentDate: (date: Date) => dispatch(setCurrentDate(date)),
      setView: (view: CalendarView) => dispatch(setView(view)),
      setSelectedCalendar: (calendarId: string) =>
        dispatch(setSelectedCalendar(calendarId)),
      navigateCalendar: (direction: NavigationDirection) =>
        dispatch(navigateCalendar(direction)),

      // UI actions
      openCreateModal: (slot: { start: Date; end: Date }) =>
        dispatch(openCreateModal(slot)),
      openEditModal: (eventId: string) => dispatch(openEditModal(eventId)),
      closeModal: () => dispatch(closeModal()),
      selectEvent: (eventId: string | null) => dispatch(selectEvent(eventId)),
      setLoading: (loading: boolean) => dispatch(setLoading(loading)),
      setError: (error: CalendarApiError | null) => dispatch(setError(error)),
    }),
    [dispatch]
  )
}

/**
 * Hook for calendar navigation.
 */
export const useCalendarNavigation = () => {
  const { currentDate, view } = useCalendarState()
  const { setCurrentDate, setView, navigateCalendar } = useCalendarActions()

  const goToPrevious = () => navigateCalendar('prev')
  const goToNext = () => navigateCalendar('next')
  const goToToday = () => setCurrentDate(new Date())

  return {
    currentDate,
    view,
    setCurrentDate,
    setView,
    goToPrevious,
    goToNext,
    goToToday,
  }
}

/**
 * Hook for event UI management (combined with TanStack Query).
 * Use this hook with TanStack Query hooks for complete event management.
 * Note: This hook provides UI state only. Use with Google Calendar mutation
 * hooks for full functionality.
 */
export const useEventManagement = () => {
  const {
    openCreateModal,
    openEditModal,
    closeModal,
    selectEvent,
    setError,
  } = useCalendarActions()

  const {
    isEventModalOpen,
    isCreateMode,
    selectedEventId,
    selectedSlot,
    isLoading: uiLoading,
    error,
  } = useCalendarUIState()

  const selectedCalendarId = useAppSelector((s) => s.calendar.selectedCalendarId)

  const queryClient = useQueryClient()

  const createMutation = useCreateGoogleCalendarEvent()
  const updateMutation = useUpdateGoogleCalendarEvent()
  const deleteMutation = useDeleteGoogleCalendarEvent()

  const isLoading =
    uiLoading ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  // Find selectedEvent by scanning cached event queries
  const selectedEvent = useMemo<CalendarEvent | null>(() => {
    if (!selectedEventId) return null
    const caches = queryClient.getQueriesData<readonly CalendarEvent[]>({
      queryKey: googleCalendarQueryKeys.events(),
    })
    for (const [key, data] of caches) {
      // Skip the "raw" cache variants (last element === 'raw')
      if (Array.isArray(key) && key[key.length - 1] === 'raw') continue
      if (!data) continue
      const found = data.find((e) => e.id === selectedEventId)
      if (found) return found
    }
    return null
  }, [selectedEventId, queryClient, isEventModalOpen])

  const createEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    try {
      await createMutation.mutateAsync({
        calendarId: selectedCalendarId,
        event: eventData,
      })
      closeModal()
    } catch (err) {
      const e = err as { message?: string; type?: string }
      setError({
        message: e?.message || 'Failed to create event',
        type: e?.type || 'UNKNOWN_ERROR',
      })
      throw err
    }
  }

  const updateEvent = async (
    eventId: string,
    updates: Partial<CalendarEvent>
  ) => {
    try {
      await updateMutation.mutateAsync({
        calendarId: selectedCalendarId,
        eventId,
        updates,
      })
      closeModal()
    } catch (err) {
      const e = err as { message?: string; type?: string }
      setError({
        message: e?.message || 'Failed to update event',
        type: e?.type || 'UNKNOWN_ERROR',
      })
      throw err
    }
  }

  const deleteEvent = async (eventId: string) => {
    try {
      await deleteMutation.mutateAsync({
        calendarId: selectedCalendarId,
        eventId,
      })
      closeModal()
    } catch (err) {
      const e = err as { message?: string; type?: string }
      setError({
        message: e?.message || 'Failed to delete event',
        type: e?.type || 'UNKNOWN_ERROR',
      })
      throw err
    }
  }

  const moveEvent = async (eventId: string, start: Date, end: Date) => {
    try {
      await updateMutation.mutateAsync({
        calendarId: selectedCalendarId,
        eventId,
        updates: { start, end },
      })
    } catch (err) {
      const e = err as { message?: string; type?: string }
      setError({
        message: e?.message || 'Failed to move event',
        type: e?.type || 'UNKNOWN_ERROR',
      })
    }
  }

  return {
    // UI State
    isEventModalOpen,
    isCreateMode,
    selectedEventId,
    selectedSlot,
    selectedEvent,
    isLoading,
    error,

    // UI Actions
    openCreateModal,
    openEditModal,
    closeModal,
    selectEvent,

    // Placeholder CRUD operations (for backward compatibility)
    createEvent,
    updateEvent,
    deleteEvent,
    moveEvent,
  }
}

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
