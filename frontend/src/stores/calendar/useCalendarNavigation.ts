'use client'

import { useCalendarState } from './useCalendarState'
import { useCalendarActions } from './useCalendarActions'

/**
 * Hook for calendar navigation.
 */
export const useCalendarNavigation = () => {
  const { currentDate, view } = useCalendarState()
  const { setCurrentDate, setView, navigateCalendar } = useCalendarActions()

  const goToPrevious = () => navigateCalendar('prev')
  const goToNext = () => navigateCalendar('next')
  const goToToday = () => setCurrentDate(new Date())

  return {
    currentDate,
    view,
    setCurrentDate,
    setView,
    goToPrevious,
    goToNext,
    goToToday,
  }
}
