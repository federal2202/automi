import moment from 'moment'

/**
 * Date predicates for the calendar component.
 */

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
