import moment from 'moment'
import { View, Views } from 'react-big-calendar'

/**
 * Calendar navigation and view-label helpers.
 */

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
 * Get available views for the calendar
 */
export const getAvailableViews = (): View[] => {
  return [Views.DAY, Views.WEEK, Views.MONTH]
}
