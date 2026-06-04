"use client"

import { useEventManagement } from '@/stores/calendarHooks'
import { CalendarEvent } from '@/types/calendar/calendar.types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DeleteEventDetails } from './DeleteEventDetails'

export interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  event: CalendarEvent
}

/**
 * DeleteConfirmationDialog Component
 *
 * Confirmation dialog for deleting calendar events.
 * Shows event details and confirms deletion action.
 */
export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  event,
}: DeleteConfirmationDialogProps) {
  const { deleteEvent, isLoading } = useEventManagement()

  const handleDelete = async () => {
    try {
      await deleteEvent(event.id)
      onClose()
    } catch (error) {
      // Error handling is managed by the store
      console.error('Failed to delete event:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="border-l-red-500/70">
          <DialogTitle className="text-red-400">Delete Event</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this event? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DeleteEventDetails event={event} />

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={onClose}
            disabled={isLoading}
            className="text-[#ffffff]/70 hover:text-white hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="gradient-destructive"
            size="lg"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
