import { CalendarEvent, CalendarView } from './event.types'

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
 * Responsive Breakpoints
 * Breakpoint definitions for responsive design
 */
export interface ResponsiveBreakpoints {
  mobile: number
  tablet: number
  desktop: number
}

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
