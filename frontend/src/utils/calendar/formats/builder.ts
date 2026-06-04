import { eventPropGetter, dayPropGetter } from './prop-getters'
import { calendarFormats, timeConfig, viewConfig, calendarStyle, calendarClasses } from './config'

/**
 * Composes the BigCalendar configuration objects into ready-to-spread props.
 */

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
