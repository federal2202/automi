'use client'

import { memo, useEffect } from 'react'
import { Views } from 'react-big-calendar'
import { cn } from '@/utils/cn'
import { CalendarProps, CalendarView } from '@/types/calendar/calendar.types'
import { CalendarToolbar } from './CalendarToolbar'
import { CalendarGrid } from './CalendarGrid'
import { FloatingChatButton } from './FloatingChatButton'
import { EventModal } from './EventModal'
import { DeleteConfirmationDialog, useDeleteConfirmation } from './DeleteConfirmationDialog'
import { useEventGeneration } from '@/hooks/calendar/useEventGeneration'
import { useCalendarState, useCalendarActions, useEventManagement } from '@/stores/calendarStore'

/**
 * Main Calendar Component (Refactored)
 * Modular architecture with extracted components using Zustand store
 * Preserves exact visual design and functionality
 */
export const Calendar = memo(({ 
  className,
  initialDate = new Date(),
  initialView = Views.WEEK,
  events: propEvents
}: CalendarProps) => {
  // Zustand store state and actions
  const { currentDate, view, events: storeEvents } = useCalendarState()
  const { setCurrentDate, setView, setEvents, navigateCalendar } = useCalendarActions()
  const { selectedEvent } = useEventManagement()
  
  // Delete confirmation dialog state
  const {
    isOpen: isDeleteDialogOpen,
    eventToDelete,
    openDeleteDialog,
    closeDeleteDialog,
  } = useDeleteConfirmation()
  
  // Sample events for initial data
  const sampleEvents = useEventGeneration()
  
  // Initialize store with props and events - only run once on mount
  useEffect(() => {
    setCurrentDate(initialDate)
    setView(initialView)
    
    // Only set events if store is empty
    if (storeEvents.length === 0) {
      setEvents(sampleEvents)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  const events = propEvents || storeEvents

  // Navigation handlers using store actions
  const handleNavigate = (direction: 'prev' | 'next') => {
    navigateCalendar(direction)
  }

  const handleViewChange = (newView: CalendarView) => {
    setView(newView)
  }

  const handleDateChange = (date: Date) => {
    setCurrentDate(date)
  }

  // Handle keyboard events for deletion
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Delete key pressed and there's a selected event
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedEvent) {
        event.preventDefault()
        openDeleteDialog(selectedEvent)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedEvent, openDeleteDialog])

  return (
    <div className={cn(
      "bg-[#0e0e0e] text-white h-full w-full flex flex-col p-2 sm:p-4 md:p-6 lg:p-8", 
      className
    )}>
      {/* Custom Toolbar */}
      <CalendarToolbar
        currentDate={currentDate}
        view={view}
        onNavigate={handleNavigate}
        onViewChange={handleViewChange}
        onDateChange={handleDateChange}
      />
      
      {/* Calendar Grid */}
      <CalendarGrid
        currentDate={currentDate}
        view={view}
        events={events}
        onViewChange={handleViewChange}
        onDateChange={handleDateChange}
      />
      
      {/* Floating Chat Button */}
      <FloatingChatButton />
      
      {/* Event Modal */}
      <EventModal />
      
      {/* Delete Confirmation Dialog */}
      {eventToDelete && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={closeDeleteDialog}
          event={eventToDelete}
        />
      )}
    </div>
  )
})

Calendar.displayName = 'Calendar'

// Keep the original export name for backward compatibility
export const WeeklyCalendar = Calendar