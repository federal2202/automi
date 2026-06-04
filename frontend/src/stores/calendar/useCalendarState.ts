'use client'

import { useAppSelector } from '../hooks'

/**
 * Hook to access calendar state (UI state only).
 * Selects primitives individually, then composes.
 */
export const useCalendarState = () => {
  const currentDate = useAppSelector((s) => s.calendar.currentDate)
  const view = useAppSelector((s) => s.calendar.view)
  const selectedCalendarId = useAppSelector((s) => s.calendar.selectedCalendarId)
  return {
    currentDate,
    view,
    selectedCalendarId,
  }
}
