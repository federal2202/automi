'use client'

import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { CalendarEvent } from '@/types/calendar/calendar.types'
import {
  useCreateGoogleCalendarEvent,
  useUpdateGoogleCalendarEvent,
  useDeleteGoogleCalendarEvent,
  googleCalendarQueryKeys,
} from '@/hooks/calendar/useGoogleCalendar'

import { useAppSelector } from '../hooks'
import { useCalendarActions } from './useCalendarActions'
import { useCalendarUIState } from './useCalendarUIState'
import { eventErrorToApiError } from './eventErrorToApiError'

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
  }, [selectedEventId, queryClient])

  const createEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    try {
      await createMutation.mutateAsync({
        calendarId: selectedCalendarId,
        event: eventData,
      })
      closeModal()
    } catch (err) {
      setError(eventErrorToApiError(err, 'Failed to create event'))
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
      setError(eventErrorToApiError(err, 'Failed to update event'))
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
      setError(eventErrorToApiError(err, 'Failed to delete event'))
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
      setError(eventErrorToApiError(err, 'Failed to move event'))
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
