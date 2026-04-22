"use client"

import { useEventManagement } from '@/stores/calendarStore'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EventForm } from './EventForm'

/**
 * EventModal Component
 * 
 * Modal for creating and editing calendar events.
 * Handles both create and edit modes based on store state.
 */
export function EventModal() {
  const {
    isEventModalOpen,
    isCreateMode,
    selectedEvent,
    selectedSlot,
    closeModal,
  } = useEventManagement()

  return (
    <Dialog open={isEventModalOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isCreateMode ? 'Create New Event' : 'Edit Event'}
          </DialogTitle>
          <DialogDescription>
            {isCreateMode 
              ? 'Fill out the form below to create a new calendar event.'
              : 'Update the event details below and save your changes.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <EventForm
          mode={isCreateMode ? 'create' : 'edit'}
          initialData={selectedEvent || undefined}
          selectedSlot={selectedSlot || undefined}
        />
      </DialogContent>
    </Dialog>
  )
}