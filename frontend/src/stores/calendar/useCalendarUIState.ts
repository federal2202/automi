'use client'

import { useAppSelector } from '../hooks'

/**
 * Hook to access UI state.
 */
export const useCalendarUIState = () => {
  const isEventModalOpen = useAppSelector((s) => s.calendar.isEventModalOpen)
  const selectedEventId = useAppSelector((s) => s.calendar.selectedEventId)
  const selectedSlot = useAppSelector((s) => s.calendar.selectedSlot)
  const isLoading = useAppSelector((s) => s.calendar.isLoading)
  const error = useAppSelector((s) => s.calendar.error)
  return {
    isEventModalOpen,
    isCreateMode: selectedSlot !== null, // Derive create mode from selectedSlot
    selectedEventId,
    selectedSlot,
    isLoading,
    error,
  }
}
