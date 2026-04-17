/**
 * Calendar Module Index
 * Central export file for the calendar component and its utilities
 */

// Types
export * from './types/calendar.types'

// Hooks
export * from '@/stores/calendarStore'
export * from './hooks/useEventGeneration'

// Utilities
export * from './utils/calendarStyles'
export * from './utils/dateUtils'
export * from './utils/calendarFormats'

// Components
export { CalendarEvent as CalendarEventComponent } from './components/CalendarEvent'
export * from './components/CalendarDayHeader'
export * from './components/CalendarToolbar'
export * from './components/CalendarGrid'
export * from './components/FloatingChatButton'
export * from './Calendar'