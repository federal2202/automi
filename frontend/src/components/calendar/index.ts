/**
 * Calendar Module Index
 * Central export file for the calendar component and its utilities
 */

// Types
export * from '@/types/calendar/calendar.types'

// Hooks (avoid conflicts by being more specific)
export { 
  useCalendarStore,
  useCalendarState,
  useCalendarUIState,
  useCalendarActions,
  useCalendarNavigation,
  useEventManagement,
  useCalendarWithEvents 
} from '@/stores/calendarStore'
export * from '@/hooks/calendar/useEventGeneration'

// Utilities
export * from '@/utils/calendar/calendarStyles'
export * from '@/utils/calendar/dateUtils'
export * from '@/utils/calendar/calendarFormats'

// Components
export { CalendarEvent as CalendarEventComponent } from './CalendarEvent'
export * from './CalendarDayHeader'
export * from './CalendarToolbar'
export * from './CalendarGrid'
export * from './FloatingChatButton'
export * from './Calendar'