import moment from 'moment'
import { View, Views } from 'react-big-calendar'

/**
 * Date Utilities for Calendar Component
 * Extracted from the original calendar implementation
 */

/**
 * Format time for display (HH:mm format)
 */
export const formatTime = (date: Date): string => {
  return moment(date).format('HH:mm')
}

/**
 * Format date for display (MMM D format)
 */
export const formatDate = (date: Date): string => {
  return moment(date).format('MMM D')
}

/**
 * Format full date for display (MMMM D, YYYY format)
 */
export const formatFullDate = (date: Date): string => {
  return moment(date).format('MMMM D, YYYY')
}

/**
 * Format month and year for display (MMMM YYYY format)
 */
export const formatMonthYear = (date: Date): string => {
  return moment(date).format('MMMM YYYY').toUpperCase()
}

/**
 * Format day name (dddd format)
 */
export const formatDayName = (date: Date): string => {
  return moment(date).format('dddd')
}

/**
 * Format day number (D format)
 */
export const formatDayNumber = (date: Date): string => {
  return moment(date).format('D')
}

/**
 * Format month abbreviation (MMM format)
 */
export const formatMonthAbbr = (date: Date): string => {
  return moment(date).format('MMM')
}

/**
 * Check if date is today
 */
export const isToday = (date: Date): boolean => {
  return moment(date).isSame(moment(), 'day')
}

/**
 * Check if date is a weekend (Saturday or Sunday)
 */
export const isWeekend = (date: Date): boolean => {
  const day = moment(date).day()
  return day === 0 || day === 6 // Sunday or Saturday
}

/**
 * Navigate calendar date based on view and direction
 */
export const navigateCalendarDate = (
  currentDate: Date, 
  view: View, 
  direction: 'prev' | 'next'
): Date => {
  const amount = direction === 'prev' ? -1 : 1
  let unit: moment.unitOfTime.DurationConstructor = 'week'
  
  if (view === Views.DAY) unit = 'day'
  else if (view === Views.MONTH) unit = 'month'
  else if (view === Views.WEEK || view === Views.WORK_WEEK) unit = 'week'
  
  return moment(currentDate).add(amount, unit).toDate()
}

/**
 * Get calendar title based on view
 */
export const getCalendarTitle = (view: View): string => {
  switch (view) {
    case Views.DAY:
      return 'DAILY MANIFEST'
    case Views.MONTH:
      return 'MONTHLY MANIFEST'
    default:
      return 'WEEKLY MANIFEST'
  }
}

/**
 * Get view label for display
 */
export const getViewLabel = (viewType: View): string => {
  switch (viewType) {
    case Views.DAY: return 'DAY'
    case Views.WEEK: return 'WEEK'
    case Views.WORK_WEEK: return 'WORK'
    case Views.MONTH: return 'MONTH'
    default: return 'WEEK'
  }
}

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
 * Get available views for the calendar
 */
export const getAvailableViews = (): View[] => {
  return [Views.DAY, Views.WEEK, Views.MONTH]
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