import { format } from 'date-fns'
import { CalendarEvent, EventType } from '@/types/calendar/calendar.types'
import { EventFormData, EventFormProps } from './event-form.types'

const DATETIME_LOCAL_FORMAT = "yyyy-MM-dd'T'HH:mm"

/**
 * Event type options for the type <Select>.
 */
export const eventTypeOptions: { value: EventType; label: string }[] = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'critical', label: 'Critical' },
  { value: 'inactive', label: 'Inactive' },
]

/**
 * Build initial form data based on mode + provided data/slot.
 */
export function getInitialFormData({
  mode,
  initialData,
  selectedSlot,
}: Pick<EventFormProps, 'mode' | 'initialData' | 'selectedSlot'>): EventFormData {
  if (mode === 'edit' && initialData) {
    return {
      title: initialData.title,
      start: format(initialData.start, DATETIME_LOCAL_FORMAT),
      end: format(initialData.end, DATETIME_LOCAL_FORMAT),
      type: initialData.type,
      description: initialData.description || '',
      isTask: initialData.isTask ?? false,
    }
  }

  if (mode === 'create' && selectedSlot) {
    return {
      title: '',
      start: format(selectedSlot.start, DATETIME_LOCAL_FORMAT),
      end: format(selectedSlot.end, DATETIME_LOCAL_FORMAT),
      type: 'primary',
      description: '',
      isTask: false,
    }
  }

  const now = new Date()
  const endTime = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour later

  return {
    title: '',
    start: format(now, DATETIME_LOCAL_FORMAT),
    end: format(endTime, DATETIME_LOCAL_FORMAT),
    type: 'primary',
    description: '',
    isTask: false,
  }
}

/**
 * Convert form state into the event payload shape.
 */
export function toEventData(formData: EventFormData): Omit<CalendarEvent, 'id'> {
  return {
    title: formData.title,
    start: new Date(formData.start),
    end: new Date(formData.end),
    type: formData.type,
    description: formData.description || undefined,
    isTask: formData.isTask,
  }
}
