import React, { useState } from 'react'
import { Views } from 'react-big-calendar'
import { cn } from '@/utils/cn'
import { CalendarProps, CalendarView } from './types/calendar.types'
import { CalendarToolbar } from './components/CalendarToolbar'
import { CalendarGrid } from './components/CalendarGrid'
import { FloatingChatButton } from './components/FloatingChatButton'
import { useEventGeneration } from './hooks/useEventGeneration'
import { navigateCalendarDate } from './utils/dateUtils'

/**
 * Main Calendar Component (Refactored)
 * Modular architecture with extracted components
 * Preserves exact visual design and functionality
 */
export const Calendar = React.memo(({ 
  className,
  initialDate = new Date(),
  initialView = Views.WEEK,
  events: propEvents
}: CalendarProps) => {
  // Local state (will be replaced with Zustand in Phase 4)
  const [currentDate, setCurrentDate] = useState(initialDate)
  const [view, setView] = useState<CalendarView>(initialView)
  
  // Sample events (will be moved to Zustand store in Phase 4)
  const sampleEvents = useEventGeneration()
  const events = propEvents || sampleEvents

  // Navigation handlers
  const handleNavigate = (direction: 'prev' | 'next') => {
    const newDate = navigateCalendarDate(currentDate, view, direction)
    setCurrentDate(newDate)
  }

  const handleViewChange = (newView: CalendarView) => {
    setView(newView)
  }

  const handleDateChange = (date: Date) => {
    setCurrentDate(date)
  }

  return (
    <div className={cn(
      "bg-[#0e0e0e] text-white h-full w-full flex flex-col p-4 md:p-6 lg:p-8", 
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