import { CalendarEvent, CalendarView, NavigationDirection } from './event.types'
import { CalendarState, CalendarUIState } from './state.types'

/**
 * Calendar Store Actions
 */
export interface CalendarStoreActions {
  setCurrentDate: (date: Date) => void
  setView: (view: CalendarView) => void
  setEvents: (events: CalendarEvent[]) => void
  navigateCalendar: (direction: NavigationDirection) => void

  // Event CRUD operations
  createEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  moveEvent: (id: string, start: Date, end: Date) => Promise<void>

  // UI state actions
  openCreateModal: (slot: { start: Date; end: Date }) => void
  openEditModal: (eventId: string) => void
  closeModal: () => void
  selectEvent: (eventId: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Legacy actions (kept for backward compatibility)
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void
  removeEvent: (id: string) => void
}

/**
 * Combined Calendar Store Interface
 */
export interface CalendarStore extends CalendarState, CalendarUIState, CalendarStoreActions {}
