import moment from 'moment'
import { View, Views } from 'react-big-calendar'

/**
 * Date-range helpers and BigCalendar format configuration.
 */

/**
 * Get start of current week (timezone-aware)
 */
export const getCurrentWeekStart = (): moment.Moment => {
  return moment().startOf('week')
}

/**
 * Get date range for a specific view and date
 */
export const getDateRange = (currentDate: Date, view: View) => {
  const momentDate = moment(currentDate)

  switch (view) {
    case Views.DAY:
      return {
        startDate: momentDate.clone().startOf('day').toDate(),
        endDate: momentDate.clone().endOf('day').toDate()
      }
    case Views.WEEK:
    case Views.WORK_WEEK:
      return {
        startDate: momentDate.clone().startOf('week').toDate(),
        endDate: momentDate.clone().endOf('week').toDate()
      }
    case Views.MONTH:
      return {
        startDate: momentDate.clone().startOf('month').startOf('week').toDate(),
        endDate: momentDate.clone().endOf('month').endOf('week').toDate()
      }
    default:
      return {
        startDate: momentDate.clone().startOf('week').toDate(),
        endDate: momentDate.clone().endOf('week').toDate()
      }
  }
}

/**
 * Format date range header for BigCalendar
 */
export const formatDateRangeHeader = ({ start, end }: { start: Date; end: Date }): string => {
  return `${moment(start).format('MMM D')} - ${moment(end).format('MMM D')}`
}

/**
 * Create BigCalendar format configurations
 */
export const getCalendarFormats = () => ({
  timeGutterFormat: 'HH:mm',
  monthHeaderFormat: 'MMMM YYYY',
  dayHeaderFormat: 'ddd',
  dayRangeHeaderFormat: formatDateRangeHeader
})
