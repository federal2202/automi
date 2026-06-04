"use client"

import { useCallback } from 'react'
import { SlotInfo } from 'react-big-calendar'
import { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop'
import { CalendarEvent } from '@/types/calendar/calendar.types'
import { useEventManagement } from '@/stores/calendarHooks'

const toDate = (value: string | Date) =>
  typeof value === 'string' ? new Date(value) : value

/**
 * Slot/event interaction handlers for the calendar grid.
 */
export function useCalendarGridHandlers() {
  const { openCreateModal, openEditModal, moveEvent, selectEvent } =
    useEventManagement()

  const handleSlotSelect = useCallback(
    (slotInfo: SlotInfo) => {
      // Only create events when selecting empty slots (not clicking events)
      if (slotInfo.action === 'select') {
        openCreateModal({ start: slotInfo.start, end: slotInfo.end })
      }
    },
    [openCreateModal]
  )

  const handleEventSelect = useCallback(
    (event: CalendarEvent) => {
      selectEvent(event.id)
      openEditModal(event.id)
    },
    [openEditModal, selectEvent]
  )

  const handleEventDrop = useCallback(
    ({ event, start, end }: EventInteractionArgs<CalendarEvent>) => {
      moveEvent(event.id, toDate(start), toDate(end))
    },
    [moveEvent]
  )

  const handleEventResize = useCallback(
    ({ event, start, end }: EventInteractionArgs<CalendarEvent>) => {
      moveEvent(event.id, toDate(start), toDate(end))
    },
    [moveEvent]
  )

  return { handleSlotSelect, handleEventSelect, handleEventDrop, handleEventResize }
}
