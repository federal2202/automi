"use client"

import { useState } from 'react'
import { useEventManagement } from '@/stores/calendarStore'
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
import { format } from 'date-fns'

/**
 * Delete Confirmation Dialog Props
 */
interface DeleteConfirmationDialogProps {
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

  /**
   * Handle event deletion
   */
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

        {/* Event Details */}
        <div className="space-y-3 py-4">
          <div>
            <span className="font-medium text-sm text-muted-foreground">Title:</span>
            <p className="text-sm">{event.title}</p>
          </div>
          
          <div>
            <span className="font-medium text-sm text-muted-foreground">Date & Time:</span>
            <p className="text-sm">
              {format(event.start, 'PPP')} at {format(event.start, 'p')} - {format(event.end, 'p')}
            </p>
          </div>
          
          <div>
            <span className="font-medium text-sm text-muted-foreground">Type:</span>
            <p className="text-sm capitalize">{event.type}</p>
          </div>
          
          {event.description && (
            <div>
              <span className="font-medium text-sm text-muted-foreground">Description:</span>
              <p className="text-sm">{event.description}</p>
            </div>
          )}
        </div>

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

/**
 * Hook to manage delete confirmation dialog state
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

  return {
    isOpen,
    eventToDelete,
    openDeleteDialog,
    closeDeleteDialog,
  }
}