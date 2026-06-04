import { CalendarEvent, EventType } from '@/types/calendar/calendar.types'

/**
 * Event Form Data Interface
 * Data structure for form state. Dates are ISO strings for datetime-local inputs.
 */
export interface EventFormData {
  title: string
  start: string
  end: string
  type: EventType
  description: string
  isTask: boolean
}

/**
 * Event Form Props Interface
 */
export interface EventFormProps {
  mode: 'create' | 'edit'
  initialData?: CalendarEvent
  selectedSlot?: { start: Date; end: Date }
}
