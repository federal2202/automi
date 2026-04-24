'use client'

import { create } from 'zustand'
import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CalendarEvent, CalendarView, NavigationDirection } from '@/types/calendar/calendar.types'
import { navigateCalendarDate } from '@/utils/calendar/dateUtils'
import {
  useCreateGoogleCalendarEvent,
  useUpdateGoogleCalendarEvent,
  useDeleteGoogleCalendarEvent,
  googleCalendarQueryKeys,
} from '@/hooks/calendar/useGoogleCalendar'

/**
 * Calendar API Error Interface
 * Represents errors that can occur during calendar operations
 */
export interface CalendarApiError {
  readonly message: string
  readonly type: string
  readonly details?: Record<string, unknown>
}

/**
 * Calendar Store State Interface
 * Immutable state structure using functional programming patterns
 */
export interface CalendarStoreState {
  readonly currentDate: Date
  readonly view: CalendarView
  readonly selectedCalendarId: string
  readonly isEventModalOpen: boolean
  readonly selectedEventId: string | null
  readonly selectedSlot: { readonly start: Date; readonly end: Date } | null
  readonly isLoading: boolean
  readonly error: CalendarApiError | null
}

/**
 * Calendar Store Actions Interface
 * Pure action functions following functional programming principles
 */
export interface CalendarStoreActions {
  readonly setCurrentDate: (date: Date) => void
  readonly setView: (view: CalendarView) => void
  readonly setSelectedCalendar: (calendarId: string) => void
  readonly navigateCalendar: (direction: NavigationDirection) => void
  readonly openCreateModal: (slot: { readonly start: Date; readonly end: Date }) => void
  readonly openEditModal: (eventId: string) => void
  readonly closeModal: () => void
  readonly selectEvent: (eventId: string | null) => void
  readonly setLoading: (loading: boolean) => void
  readonly setError: (error: CalendarApiError | null) => void
  readonly clearError: () => void
}

/**
 * Combined Calendar Store Interface
 * Union of state and actions for type safety
 */
export type CalendarStore = CalendarStoreState & CalendarStoreActions

/**
 * Create Calendar Store using functional pattern with Zustand
 * Follows pure functional programming principles with immutable state
 * UI-only store - events are handled by TanStack Query for better separation of concerns
 */
export const useCalendarStore = create<CalendarStore>(
  (set, get) => ({
    // Immutable State
    currentDate: new Date(),
    view: 'week' as CalendarView,
    selectedCalendarId: 'primary',
    isEventModalOpen: false,
    selectedEventId: null,
    selectedSlot: null,
    isLoading: false,
    error: null,

    // Pure Action Functions
    setCurrentDate: (date: Date) => {
      set({ currentDate: date })
    },

    setView: (view: CalendarView) => {
      set({ view })
    },

    setSelectedCalendar: (calendarId: string) => {
      set({ selectedCalendarId: calendarId })
    },

    navigateCalendar: (direction: NavigationDirection) => {
      const state = get()
      const newDate = navigateCalendarDate(state.currentDate, state.view, direction)
      set({ currentDate: newDate })
    },

    openCreateModal: (slot: { readonly start: Date; readonly end: Date }) => {
      set({ 
        isEventModalOpen: true, 
        selectedSlot: slot,
        selectedEventId: null,
        error: null 
      })
    },

    openEditModal: (eventId: string) => {
      set({ 
        isEventModalOpen: true, 
        selectedEventId: eventId,
        selectedSlot: null,
        error: null 
      })
    },

    closeModal: () => {
      set({ 
        isEventModalOpen: false, 
        selectedEventId: null,
        selectedSlot: null,
        error: null 
      })
    },

    selectEvent: (eventId: string | null) => {
      set({ selectedEventId: eventId })
    },

    setLoading: (loading: boolean) => {
      set({ isLoading: loading })
    },

    setError: (error: CalendarApiError | null) => {
      set({ error })
    },

    clearError: () => {
      set({ error: null })
    },
  })
)

/**
 * Hook to access calendar state (UI state only)
 */
export const useCalendarState = () => {
  const store = useCalendarStore()
  return {
    currentDate: store.currentDate,
    view: store.view,
    selectedCalendarId: store.selectedCalendarId,
  }
}

/**
 * Hook to access UI state
 */
export const useCalendarUIState = () => {
  const store = useCalendarStore()
  return {
    isEventModalOpen: store.isEventModalOpen,
    isCreateMode: store.selectedSlot !== null, // Derive create mode from selectedSlot
    selectedEventId: store.selectedEventId,
    selectedSlot: store.selectedSlot,
    isLoading: store.isLoading,
    error: store.error,
  }
}

/**
 * Hook to access calendar actions
 */
export const useCalendarActions = () => {
  const store = useCalendarStore()
  return {
    setCurrentDate: store.setCurrentDate,
    setView: store.setView,
    setSelectedCalendar: store.setSelectedCalendar,
    navigateCalendar: store.navigateCalendar,
    
    // UI actions
    openCreateModal: store.openCreateModal,
    openEditModal: store.openEditModal,
    closeModal: store.closeModal,
    selectEvent: store.selectEvent,
    setLoading: store.setLoading,
    setError: store.setError,
  }
}

/**
 * Hook for calendar navigation
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
 * Hook for event UI management (combined with TanStack Query)
 * Use this hook with TanStack Query hooks for complete event management
 * Note: This hook provides UI state only. Use with Google Calendar mutation hooks for full functionality.
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

  const selectedCalendarId = useCalendarStore((s) => s.selectedCalendarId)

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
    } catch (err: any) {
      setError({
        message: err?.message || 'Failed to create event',
        type: err?.type || 'UNKNOWN_ERROR',
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
    } catch (err: any) {
      setError({
        message: err?.message || 'Failed to update event',
        type: err?.type || 'UNKNOWN_ERROR',
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
    } catch (err: any) {
      setError({
        message: err?.message || 'Failed to delete event',
        type: err?.type || 'UNKNOWN_ERROR',
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
    } catch (err: any) {
      setError({
        message: err?.message || 'Failed to move event',
        type: err?.type || 'UNKNOWN_ERROR',
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
 * Hook that combines Zustand UI state with TanStack Query data
 * @param events - Events from TanStack Query
 * @returns Combined state with selected event
 */
export const useCalendarWithEvents = (events: CalendarEvent[] = []) => {
  const uiState = useCalendarUIState()
  const calendarState = useCalendarState()
  const actions = useCalendarActions()
  
  const selectedEvent = uiState.selectedEventId 
    ? events.find(event => event.id === uiState.selectedEventId) 
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