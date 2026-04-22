import moment from 'moment'
import { CalendarEvent } from '@/types/calendar/calendar.types'

/**
 * BigCalendar Format Configurations
 * Extracted from the original calendar component
 */

/**
 * BigCalendar format configurations
 * These formats control how dates and times are displayed in the calendar
 */
export const calendarFormats = {
  timeGutterFormat: 'HH:mm',
  monthHeaderFormat: 'MMMM YYYY',
  dayHeaderFormat: 'ddd',
  dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) => {
    return `${moment(start).format('MMM D')} - ${moment(end).format('MMM D')}`
  }
}

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

/**
 * BigCalendar time configuration
 * Defines the time range and slot configuration
 */
export const timeConfig = {
  min: new Date(0, 0, 0, 0, 0, 0),     // Start at 00:00
  max: new Date(0, 0, 0, 23, 59, 59),  // End at 23:59
  step: 30,                            // 30-minute intervals
  timeslots: 2                         // 2 slots per step (15-minute sub-intervals)
}

/**
 * BigCalendar view configuration
 * Defines available views and default settings
 */
export const viewConfig = {
  defaultView: 'week' as const,
  availableViews: ['day', 'week', 'month'] as const,
  showWeekends: true,
  startAccessor: 'start' as const,
  endAccessor: 'end' as const,
}

/**
 * BigCalendar style configuration
 * Main styling properties for the calendar container
 */
export const calendarStyle = {
  height: '100%',
  minHeight: '400px'
}

/**
 * BigCalendar class configuration
 * CSS classes applied to the calendar
 */
export const calendarClasses = {
  calendar: 'automi-calendar text-xs sm:text-sm md:text-base',
  container: 'bg-[#0e0e0e] text-white h-full w-full flex flex-col p-4 md:p-6 lg:p-8',
  contentWrapper: 'w-full flex-1 flex flex-col min-h-0 min-w-0'
}

/**
 * Month view specific configurations
 */
export const monthViewConfig = {
  eventPropGetter: (event: CalendarEvent) => ({
    style: {
      backgroundColor: 'transparent',
      border: 'none',
      padding: 0,
      height: 'auto',
      minHeight: '6px' // Smaller height for month view dots
    },
    className: `event-type-${event.type}`
  }),
  
  dateHeader: ({ date }: { date: Date }) => {
    const isToday = moment(date).isSame(moment(), 'day')
    const className = `text-center p-1 ${isToday ? 'bg-[#059669] text-white rounded-md font-bold' : ''}`
    return {
      className,
      content: moment(date).format('D')
    }
  }
}

/**
 * Complete BigCalendar configuration object
 * Ready to be spread into BigCalendar component props
 */
export const getCalendarConfig = () => ({
  startAccessor: viewConfig.startAccessor,
  endAccessor: viewConfig.endAccessor,
  style: calendarStyle,
  views: viewConfig.availableViews,
  formats: calendarFormats,
  eventPropGetter,
  dayPropGetter,
  className: calendarClasses.calendar,
  ...timeConfig
})