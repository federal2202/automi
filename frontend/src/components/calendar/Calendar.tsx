'use client'

import { memo, useEffect, useMemo, useState } from 'react'
import { Views } from 'react-big-calendar'
import { cn } from '@/utils/cn'
import { CalendarProps, CalendarView } from '@/types/calendar/calendar.types'
import { CalendarToolbar } from './CalendarToolbar'
import { CalendarGrid } from './CalendarGrid'
import { FloatingChatButton } from './FloatingChatButton'
import { EventModal } from './EventModal'
import { DeleteConfirmationDialog, useDeleteConfirmation } from './DeleteConfirmationDialog'
import { useCalendarWithGoogle } from '@/hooks/calendar/useCalendarWithGoogle'
import { useCalendarActions, useEventManagement } from '@/stores/calendarHooks'
import { Loader } from '@/components/shared/Loader'

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
  // Google Calendar integration with fallback to sample data
  const { 
    events: calendarEvents, 
    calendars,
    isLoading,
    error,
    isUsingGoogleCalendar,
    currentDate,
    view,
    refetch
  } = useCalendarWithGoogle()
  
  const { setCurrentDate, setView, navigateCalendar } = useCalendarActions()
  const { selectedEvent } = useEventManagement()
  
  // Delete confirmation dialog state
  const {
    isOpen: isDeleteDialogOpen,
    eventToDelete,
    openDeleteDialog,
    closeDeleteDialog,
  } = useDeleteConfirmation()
  
  // Initialize store with props - only run once on mount
  useEffect(() => {
    setCurrentDate(initialDate)
    setView(initialView)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  // Use prop events if provided, otherwise use calendar events (Google or sample)
  const events = propEvents || calendarEvents

  // One-shot "just finished onboarding" stagger animation. We read & clear
  // the flag synchronously on first mount so a page refresh doesn't replay
  // the celebration, and Strict Mode's double-invoke naturally results in
  // a single playthrough (second mount sees no flag).
  const [justOnboarded, setJustOnboarded] = useState(false)
  useEffect(() => {
    try {
      if (sessionStorage.getItem('justOnboarded') === '1') {
        sessionStorage.removeItem('justOnboarded')
        setJustOnboarded(true)
      }
    } catch {
      // sessionStorage can throw in private modes — silently skip the anim.
    }
  }, [])

  // Build a stable eventId -> stagger-index map, sorted by start time
  // ascending so events visually settle from earliest to latest. The cap
  // at 12 keeps a packed week from taking >1.1s to finish settling.
  const staggerMap = useMemo(() => {
    if (!justOnboarded) return null
    const map = new Map<string, number>()
    const sorted = [...events].sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    )
    sorted.forEach((e, i) => map.set(e.id, Math.min(i, 12)))
    return map
  }, [justOnboarded, events])

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

  // Show loading state with branded loader (sidebar remains visible/usable)
  if (isLoading) {
    return (
      <div
        className={cn(
          'bg-[#0e0e0e] text-white h-full w-full flex flex-col items-center justify-center p-8',
          className
        )}
      >
        <Loader
          size="lg"
          label={
            isUsingGoogleCalendar
              ? 'LOADING CALENDAR // SYNCING EVENTS'
              : 'LOADING CALENDAR'
          }
        />
      </div>
    )
  }

  return (
    <div className={cn(
      "bg-[#0e0e0e] text-white h-full w-full flex flex-col p-2 sm:p-4 md:p-6 lg:p-8", 
      className
    )}>
      {/* Error message if Google Calendar failed but we have fallback data */}
      {error && !isUsingGoogleCalendar && (
        <div className="mb-4 p-3 bg-yellow-900/50 border border-yellow-600 rounded-lg">
          <p className="text-sm text-yellow-200">
            Unable to connect to Google Calendar. Showing sample data. 
            <button 
              onClick={() => refetch()}
              className="ml-2 underline hover:no-underline"
            >
              Retry
            </button>
          </p>
        </div>
      )}
      
      {/* Custom Toolbar */}
      <CalendarToolbar
        currentDate={currentDate}
        view={view}
        calendars={calendars.map(cal => ({
          id: cal.id,
          summary: cal.summary,
          primary: cal.primary,
          backgroundColor: cal.backgroundColor,
          foregroundColor: cal.foregroundColor
        }))}
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
        staggerMap={staggerMap}
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