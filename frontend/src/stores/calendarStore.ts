'use client'

import { create } from 'zustand'
import { CalendarStore, CalendarEvent, CalendarView, NavigationDirection } from '@/components/calendar/types/calendar.types'
import { navigateCalendarDate } from '@/components/calendar/utils/dateUtils'

// Import Views dynamically to avoid SSR issues
const Views = {
  MONTH: 'month' as const,
  WEEK: 'week' as const,
  WORK_WEEK: 'work_week' as const,
  DAY: 'day' as const,
  AGENDA: 'agenda' as const
}

/**
 * Generate unique ID for events
 */
const generateEventId = (): string => {
  return `event_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Enhanced Calendar State Management with Zustand
 * Centralized store for calendar state, UI state, and actions
 */
export const useCalendarStore = create<CalendarStore>((set, get) => ({
  // Calendar state
  currentDate: new Date(),
  view: Views.WEEK,
  events: [],

  // UI state
  isEventModalOpen: false,
  isCreateMode: false,
  selectedEventId: null,
  selectedSlot: null,
  isLoading: false,
  error: null,

  // Calendar actions
  setCurrentDate: (date: Date) => {
    set({ currentDate: date })
  },

  setView: (view: CalendarView) => {
    set({ view })
  },

  setEvents: (events: CalendarEvent[]) => {
    set({ events })
  },

  navigateCalendar: (direction: NavigationDirection) => {
    const { currentDate, view } = get()
    const newDate = navigateCalendarDate(currentDate, view, direction)
    set({ currentDate: newDate })
  },

  // Enhanced Event CRUD operations
  createEvent: async (eventData: Omit<CalendarEvent, 'id'>) => {
    try {
      set({ isLoading: true, error: null })
      
      const { events } = get()
      const newEvent: CalendarEvent = {
        ...eventData,
        id: generateEventId()
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      set({ 
        events: [...events, newEvent],
        isLoading: false,
        isEventModalOpen: false,
        selectedSlot: null,
        isCreateMode: false
      })
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to create event' 
      })
    }
  },

  updateEvent: async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      set({ isLoading: true, error: null })
      
      const { events } = get()
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const updatedEvents = events.map(event =>
        event.id === id ? { ...event, ...updates } : event
      )
      
      set({ 
        events: updatedEvents,
        isLoading: false,
        isEventModalOpen: false,
        selectedEventId: null,
        isCreateMode: false
      })
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to update event' 
      })
    }
  },

  deleteEvent: async (id: string) => {
    try {
      set({ isLoading: true, error: null })
      
      const { events } = get()
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const filteredEvents = events.filter(event => event.id !== id)
      
      set({ 
        events: filteredEvents,
        isLoading: false,
        selectedEventId: null
      })
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to delete event' 
      })
    }
  },

  moveEvent: async (id: string, start: Date, end: Date) => {
    try {
      set({ isLoading: true, error: null })
      
      const { events } = get()
      
      // Optimistically update the UI first
      const updatedEvents = events.map(event =>
        event.id === id ? { ...event, start, end } : event
      )
      set({ events: updatedEvents })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      set({ isLoading: false })
    } catch (error) {
      // Revert the change on error
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to move event' 
      })
    }
  },

  // UI state actions
  openCreateModal: (slot: { start: Date; end: Date }) => {
    set({ 
      isEventModalOpen: true, 
      isCreateMode: true, 
      selectedSlot: slot,
      selectedEventId: null,
      error: null 
    })
  },

  openEditModal: (eventId: string) => {
    set({ 
      isEventModalOpen: true, 
      isCreateMode: false, 
      selectedEventId: eventId,
      selectedSlot: null,
      error: null 
    })
  },

  closeModal: () => {
    set({ 
      isEventModalOpen: false, 
      isCreateMode: false, 
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

  setError: (error: string | null) => {
    set({ error })
  },

  // Legacy actions (kept for backward compatibility)
  addEvent: (event: Omit<CalendarEvent, 'id'>) => {
    const { events } = get()
    const newEvent: CalendarEvent = {
      ...event,
      id: generateEventId()
    }
    set({ events: [...events, newEvent] })
  },

  removeEvent: (id: string) => {
    const { events } = get()
    const filteredEvents = events.filter(event => event.id !== id)
    set({ events: filteredEvents })
  },
}))

/**
 * Hook to access calendar state
 */
export const useCalendarState = () => {
  const store = useCalendarStore()
  return {
    currentDate: store.currentDate,
    view: store.view,
    events: store.events,
  }
}

/**
 * Hook to access UI state
 */
export const useCalendarUIState = () => {
  const store = useCalendarStore()
  return {
    isEventModalOpen: store.isEventModalOpen,
    isCreateMode: store.isCreateMode,
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
    setEvents: store.setEvents,
    navigateCalendar: store.navigateCalendar,
    
    // Enhanced event operations
    createEvent: store.createEvent,
    updateEvent: store.updateEvent,
    deleteEvent: store.deleteEvent,
    moveEvent: store.moveEvent,
    
    // UI actions
    openCreateModal: store.openCreateModal,
    openEditModal: store.openEditModal,
    closeModal: store.closeModal,
    selectEvent: store.selectEvent,
    setLoading: store.setLoading,
    setError: store.setError,
    
    // Legacy actions
    addEvent: store.addEvent,
    removeEvent: store.removeEvent,
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
 * Hook for event management
 */
export const useEventManagement = () => {
  const { 
    createEvent, 
    updateEvent, 
    deleteEvent, 
    moveEvent,
    openCreateModal, 
    openEditModal, 
    closeModal,
    selectEvent 
  } = useCalendarActions()
  
  const { 
    isEventModalOpen, 
    isCreateMode, 
    selectedEventId, 
    selectedSlot, 
    isLoading, 
    error 
  } = useCalendarUIState()
  
  const { events } = useCalendarState()
  
  const selectedEvent = selectedEventId 
    ? events.find(event => event.id === selectedEventId) 
    : null

  return {
    // State
    events,
    selectedEvent,
    isEventModalOpen,
    isCreateMode,
    selectedSlot,
    isLoading,
    error,
    
    // Actions
    createEvent,
    updateEvent,
    deleteEvent,
    moveEvent,
    openCreateModal,
    openEditModal,
    closeModal,
    selectEvent,
  }
}