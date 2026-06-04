"use client"

import { useEffect } from 'react'
import { CalendarEvent } from '@/types/calendar/calendar.types'

/**
 * Open the delete-confirmation dialog when Delete/Backspace is pressed and an
 * event is currently selected.
 */
export function useDeleteKeyShortcut(
  selectedEvent: CalendarEvent | null,
  openDeleteDialog: (event: CalendarEvent) => void
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedEvent) {
        event.preventDefault()
        openDeleteDialog(selectedEvent)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedEvent, openDeleteDialog])
}
