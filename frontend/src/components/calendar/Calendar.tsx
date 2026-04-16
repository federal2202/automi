'use client'

import React, { useEffect } from 'react'
import { Views } from 'react-big-calendar'
import { cn } from '@/utils/cn'
import { CalendarProps, CalendarView } from './types/calendar.types'
import { CalendarToolbar } from './components/CalendarToolbar'
import { CalendarGrid } from './components/CalendarGrid'
import { FloatingChatButton } from './components/FloatingChatButton'
import { useEventGeneration } from './hooks/useEventGeneration'
import { useCalendarState, useCalendarActions } from './hooks/useCalendarState'

/**
 * Main Calendar Component (Refactored)
 * Modular architecture with extracted components using Zustand store
 * Preserves exact visual design and functionality
 */
export const Calendar = React.memo(({ 
  className,
  initialDate = new Date(),
  initialView = Views.WEEK,
  events: propEvents
}: CalendarProps) => {
  // Zustand store state and actions
  const { currentDate, view, events: storeEvents } = useCalendarState()
  const { setCurrentDate, setView, setEvents, navigateCalendar } = useCalendarActions()
  
  // Sample events for initial data
  const sampleEvents = useEventGeneration()
  
  // Initialize store with props or sample data
  useEffect(() => {
    if (initialDate && currentDate.getTime() !== initialDate.getTime()) {
      setCurrentDate(initialDate)
    }
    if (initialView && view !== initialView) {
      setView(initialView)
    }
  }, [initialDate, initialView, currentDate, view, setCurrentDate, setView])
  
  // Set events from props or use sample events if store is empty
  useEffect(() => {
    const eventsToUse = propEvents || sampleEvents
    if (storeEvents.length === 0 && eventsToUse.length > 0) {
      setEvents(eventsToUse)
    }
  }, [propEvents, sampleEvents, storeEvents.length, setEvents])
  
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
    </div>
  )
})

Calendar.displayName = 'Calendar'

// Keep the original export name for backward compatibility
export const WeeklyCalendar = Calendar