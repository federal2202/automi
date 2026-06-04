import { CalendarEvent, CalendarView } from './event.types'
import { CalendarConfig } from './state.types'

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
