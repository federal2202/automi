"use client"

import { useState } from 'react'
import { CalendarEvent } from '@/types/calendar/calendar.types'

/**
 * Hook to manage delete confirmation dialog state.
 */
export function useDeleteConfirmation() {
  const [isOpen, setIsOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null)

  const openDeleteDialog = (event: CalendarEvent) => {
    setEventToDelete(event)
    setIsOpen(true)
  }

  const closeDeleteDialog = () => {
    setIsOpen(false)
    setEventToDelete(null)
  }

  return { isOpen, eventToDelete, openDeleteDialog, closeDeleteDialog }
}
