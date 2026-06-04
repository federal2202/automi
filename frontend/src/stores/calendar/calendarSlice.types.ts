import type { CalendarView } from '@/types/calendar/calendar.types'

/**
 * Calendar API Error Interface
 * Represents errors that can occur during calendar operations.
 */
export interface CalendarApiError {
  readonly message: string
  readonly type: string
  readonly details?: Record<string, unknown>
}

/**
 * Calendar UI state shape (ported 1:1 from the Zustand store).
 */
export interface CalendarState {
  currentDate: Date
  view: CalendarView
  selectedCalendarId: string
  isEventModalOpen: boolean
  selectedEventId: string | null
  selectedSlot: { start: Date; end: Date } | null
  isLoading: boolean
  error: CalendarApiError | null
}

export const initialCalendarState: CalendarState = {
  currentDate: new Date(),
  view: 'week' as CalendarView,
  selectedCalendarId: 'primary',
  isEventModalOpen: false,
  selectedEventId: null,
  selectedSlot: null,
  isLoading: false,
  error: null,
}
