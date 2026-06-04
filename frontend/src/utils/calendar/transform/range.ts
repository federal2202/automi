/**
 * Date-range helpers for Google Calendar API queries.
 */

/**
 * Gets the appropriate date range for calendar API queries based on current view
 *
 * @param currentDate - The current date being displayed
 * @param view - The current calendar view (month, week, day, etc.)
 * @returns Object with timeMin and timeMax dates for API queries
 */
export const getCalendarDateRange = (currentDate: Date, view: string) => {
  const start = new Date(currentDate)
  const end = new Date(currentDate)

  // Reset to start of day
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)

  switch (view) {
    case 'month':
      // Start from first day of month, end at last day of month
      start.setDate(1)
      end.setMonth(end.getMonth() + 1, 0)
      break

    case 'week': {
      // Start from Sunday of current week, end at Saturday
      const dayOfWeek = start.getDay()
      start.setDate(start.getDate() - dayOfWeek)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      break
    }

    case 'day':
      // Single day - start and end are the same day
      end.setDate(end.getDate())
      break

    default:
      // Default to month view
      start.setDate(1)
      end.setMonth(end.getMonth() + 1, 0)
  }

  return { timeMin: start, timeMax: end }
}
