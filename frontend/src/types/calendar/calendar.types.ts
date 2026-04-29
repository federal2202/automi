import { View } from 'react-big-calendar'

/**
 * Calendar Event Interface
 * Represents a single event in the calendar
 */
export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: EventType
  description?: string
  isTask?: boolean
}

/**
 * Event Type Variants
 * Determines the styling and visual appearance of events
 */
export type EventType = 'primary' | 'secondary' | 'critical' | 'inactive'

/**
 * Calendar View Types
 * Re-export from react-big-calendar for type safety
 */
export type CalendarView = View

/**
 * Calendar State Interface
 * Central state for calendar component
 */
export interface CalendarState {
  currentDate: Date
  view: CalendarView
  events: CalendarEvent[]
}

/**
 * Calendar Configuration
 * Settings and options for calendar behavior
 */
export interface CalendarConfig {
  timeFormat: string
  stepMinutes: number
  timeslots: number
  minTime: Date
  maxTime: Date
  showWeekends: boolean
}

/**
 * Calendar Props Interface
 * Props for the main Calendar component
 */
export interface CalendarProps {
  className?: string
  initialDate?: Date
  initialView?: CalendarView
  events?: CalendarEvent[]
  config?: Partial<CalendarConfig>
}

/**
 * Event Style Configuration
 * Style mappings for different event types
 */
export type EventStyleConfig = {
  [K in EventType]: {
    container: string
    title: string
    time: string
    description: string
  }
}

/**
 * Responsive Breakpoints
 * Breakpoint definitions for responsive design
 */
export interface ResponsiveBreakpoints {
  mobile: number
  tablet: number
  desktop: number
}

/**
 * Calendar Toolbar Props
 */
export interface CalendarToolbarProps {
  currentDate: Date
  view: CalendarView
  calendars?: Array<{
    id: string
    summary: string
    primary?: boolean
    backgroundColor?: string
    foregroundColor?: string
  }>
  onNavigate: (direction: 'prev' | 'next') => void
  onViewChange: (view: CalendarView) => void
  onDateChange: (date: Date) => void
}

/**
 * Calendar Event Props
 */
export interface CalendarEventProps {
  event: CalendarEvent
  view?: CalendarView
}

/**
 * Calendar Day Header Props
 */
export interface CalendarDayHeaderProps {
  date: Date
  label: string
  view?: CalendarView
}

/**
 * Navigation Direction
 */
export type NavigationDirection = 'prev' | 'next'

/**
 * Calendar UI State Interface
 * UI-specific state for modals, selections, etc.
 */
export interface CalendarUIState {
  isEventModalOpen: boolean
  isCreateMode: boolean
  selectedEventId: string | null
  selectedSlot: { start: Date; end: Date } | null
  isLoading: boolean
  error: string | null
}

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