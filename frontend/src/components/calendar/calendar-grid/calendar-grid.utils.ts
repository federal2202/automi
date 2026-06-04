import moment from 'moment'
import { CalendarEvent, CalendarView } from '@/types/calendar/calendar.types'

/**
 * Event style getter — duration-proportional with no height constraints.
 * In month view CSS handles chip styling; elsewhere we strip the default box.
 */
export function getEventStyle(event: CalendarEvent, view: CalendarView) {
  if (view === 'month') {
    return { className: `event-type-${event.type}` }
  }
  return {
    style: {
      backgroundColor: 'transparent',
      border: 'none',
      padding: 0,
      height: 'auto',
    },
    className: `event-type-${event.type}`,
  }
}

/**
 * Day prop getter — preserves today highlighting.
 */
export function getDayProps(date: Date) {
  const isToday = moment(date).isSame(moment(), 'day')
  return {
    style: {
      backgroundColor: isToday ? 'rgba(2,44,34,0.02)' : 'transparent',
    },
  }
}
