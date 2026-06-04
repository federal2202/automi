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
  /**
   * Per-event accent color as a hex string (e.g. '#33b679'), derived from the
   * Google Calendar event `colorId`. When absent, the renderer falls back to
   * the brand green. Drives the card fill / left-border / accent text.
   */
  color?: string
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
 * Navigation Direction
 */
export type NavigationDirection = 'prev' | 'next'

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
