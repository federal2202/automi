import { create } from 'zustand'
import { Views } from 'react-big-calendar'
import { CalendarStore, CalendarEvent, CalendarView, NavigationDirection } from '../types/calendar.types'
import { navigateCalendarDate } from '../utils/dateUtils'

/**
 * Calendar State Management with Zustand
 * Centralized store for calendar state and actions
 */
export const useCalendarStore = create<CalendarStore>((set, get) => ({
  // Initial state
  currentDate: new Date(),
  view: Views.WEEK,
  events: [],

  // Actions
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

  addEvent: (event: Omit<CalendarEvent, 'id'>) => {
    const { events } = get()
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString() // Simple ID generation
    }
    set({ events: [...events, newEvent] })
  },

  updateEvent: (id: string, updates: Partial<CalendarEvent>) => {
    const { events } = get()
    const updatedEvents = events.map(event =>
      event.id === id ? { ...event, ...updates } : event
    )
    set({ events: updatedEvents })
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
 * Hook to access calendar actions
 */
export const useCalendarActions = () => {
  const store = useCalendarStore()
  return {
    setCurrentDate: store.setCurrentDate,
    setView: store.setView,
    setEvents: store.setEvents,
    navigateCalendar: store.navigateCalendar,
    addEvent: store.addEvent,
    updateEvent: store.updateEvent,
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