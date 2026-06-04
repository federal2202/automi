import moment from 'moment'
import { CalendarEvent } from '@/types/calendar/calendar.types'

/**
 * BigCalendar prop getters for events and day columns.
 */

/**
 * BigCalendar event prop getter
 * Returns styling configuration for events
 */
export const eventPropGetter = (event: CalendarEvent) => {
  return {
    style: {
      backgroundColor: 'transparent',
      border: 'none',
      padding: 0,
      height: 'auto',
      minHeight: '120px' // Default for week/day views
    },
    className: `event-type-${event.type}`
  }
}

/**
 * BigCalendar day prop getter
 * Returns styling configuration for day columns
 */
export const dayPropGetter = (date: Date) => {
  const isToday = moment(date).isSame(moment(), 'day')
  return {
    style: {
      backgroundColor: isToday ? 'rgba(2,44,34,0.02)' : 'transparent'
    }
  }
}
