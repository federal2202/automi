'use client'

import { memo, useEffect } from 'react'
import { Views } from 'react-big-calendar'
import { CalendarProps, CalendarView } from '@/types/calendar/calendar.types'
import { useDeleteConfirmation } from '../DeleteConfirmationDialog'
import { useCalendarWithGoogle } from '@/hooks/calendar/useCalendarWithGoogle'
import { useCalendarActions, useEventManagement } from '@/stores/calendarHooks'
import { useOnboardingStagger } from './useOnboardingStagger'
import { useDeleteKeyShortcut } from './useDeleteKeyShortcut'
import { CalendarLoadingState } from './CalendarLoadingState'
import { CalendarShell } from './CalendarShell'

/**
 * Main Calendar Component
 * Modular architecture with extracted components using the Zustand store.
 */
export const Calendar = memo(
  ({
    className,
    initialDate = new Date(),
    initialView = Views.WEEK,
    events: propEvents,
  }: CalendarProps) => {
    const {
      events: calendarEvents,
      calendars,
      isLoading,
      error,
      isUsingGoogleCalendar,
      currentDate,
      view,
      refetch,
    } = useCalendarWithGoogle()

    const { setCurrentDate, setView, navigateCalendar } = useCalendarActions()
    const { selectedEvent } = useEventManagement()

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

    const events = propEvents || calendarEvents
    const staggerMap = useOnboardingStagger(events)

    useDeleteKeyShortcut(selectedEvent, openDeleteDialog)

    if (isLoading) {
      return (
        <CalendarLoadingState
          isUsingGoogleCalendar={isUsingGoogleCalendar}
          className={className}
        />
      )
    }

    return (
      <CalendarShell
        className={className}
        currentDate={currentDate}
        view={view}
        events={events}
        calendars={calendars.map((cal) => ({
          id: cal.id,
          summary: cal.summary,
          primary: cal.primary,
          backgroundColor: cal.backgroundColor,
          foregroundColor: cal.foregroundColor,
        }))}
        showError={Boolean(error) && !isUsingGoogleCalendar}
        staggerMap={staggerMap}
        isDeleteDialogOpen={isDeleteDialogOpen}
        eventToDelete={eventToDelete}
        onRetry={() => refetch()}
        onNavigate={(direction) => navigateCalendar(direction)}
        onViewChange={(newView: CalendarView) => setView(newView)}
        onDateChange={(date: Date) => setCurrentDate(date)}
        onCloseDelete={closeDeleteDialog}
      />
    )
  }
)

Calendar.displayName = 'Calendar'

// Keep the original export name for backward compatibility
export const WeeklyCalendar = Calendar
