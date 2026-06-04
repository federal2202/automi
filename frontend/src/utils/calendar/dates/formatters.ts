import moment from 'moment'

/**
 * Date/time display formatters for the calendar component.
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
