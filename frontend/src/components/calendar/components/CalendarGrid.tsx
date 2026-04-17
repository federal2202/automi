'use client'

import React, { useCallback } from 'react'
import { Calendar as BigCalendar, momentLocalizer, SlotInfo } from 'react-big-calendar'
import withDragAndDrop, { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop'
import moment from 'moment'
import { cn } from '@/utils/cn'
import { CalendarEvent, CalendarView } from '../types/calendar.types'
import { CalendarEvent as CalendarEventComponent } from './CalendarEvent'
import { CalendarDayHeader } from './CalendarDayHeader'
import { getAvailableViews, getCalendarFormats } from '../utils/dateUtils'
import { useEventManagement } from '@/stores/calendarStore'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

const localizer = momentLocalizer(moment)
const DragAndDropCalendar = withDragAndDrop<CalendarEvent>(BigCalendar)

interface CalendarGridProps {
  currentDate: Date
  view: CalendarView
  events: CalendarEvent[]
  onViewChange: (view: CalendarView) => void
  onDateChange: (date: Date) => void
  className?: string
}

/**
 * CalendarGrid Component
 * BigCalendar wrapper with custom components and event handlers
 */
export const CalendarGrid = React.memo(({ 
  currentDate, 
  view, 
  events, 
  onViewChange, 
  onDateChange, 
  className 
}: CalendarGridProps) => {
  const { openCreateModal, openEditModal, moveEvent, selectEvent } = useEventManagement()
  
  // Event interaction handlers
  const handleSlotSelect = useCallback((slotInfo: SlotInfo) => {
    // Only create events when selecting empty slots (not clicking existing events)
    if (slotInfo.action === 'select') {
      openCreateModal({
        start: slotInfo.start,
        end: slotInfo.end
      })
    }
  }, [openCreateModal])
  
  const handleEventSelect = useCallback((event: CalendarEvent) => {
    selectEvent(event.id)
    openEditModal(event.id)
  }, [openEditModal, selectEvent])
  
  const handleEventDrop = useCallback((args: EventInteractionArgs<CalendarEvent>) => {
    const { event, start, end } = args
    const startDate = typeof start === 'string' ? new Date(start) : start
    const endDate = typeof end === 'string' ? new Date(end) : end
    moveEvent(event.id, startDate, endDate)
  }, [moveEvent])
  
  const handleEventResize = useCallback((args: EventInteractionArgs<CalendarEvent>) => {
    const { event, start, end } = args
    const startDate = typeof start === 'string' ? new Date(start) : start
    const endDate = typeof end === 'string' ? new Date(end) : end
    moveEvent(event.id, startDate, endDate)
  }, [moveEvent])
  
  // Event style getter - duration-proportional with no height constraints
  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: 'transparent',
        border: 'none',
        padding: 0,
        height: 'auto',
        // Remove minHeight for week/day views to preserve duration scaling
        // Only apply minHeight for month view dots
        minHeight: view === 'month' ? '6px' : undefined
      },
      className: `event-type-${event.type}`
    }
  }

  // Day prop getter - preserves today highlighting
  const dayPropGetter = (date: Date) => {
    const isToday = moment(date).isSame(moment(), 'day')
    return {
      style: {
        backgroundColor: isToday ? 'rgba(2,44,34,0.02)' : 'transparent'
      }
    }
  }

  // Month view date header component
  const MonthDateHeader = ({ date }: { date: Date }) => {
    const isToday = moment(date).isSame(moment(), 'day')
    return (
      <div className={cn(
        "text-center p-1",
        isToday && "bg-[#059669] text-white rounded-md font-bold"
      )}>
        {moment(date).format('D')}
      </div>
    )
  }

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
      <DragAndDropCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ 
          height: '100%',
          minHeight: '400px'
        }}
        view={view}
        onView={onViewChange}
        views={getAvailableViews()}
        date={currentDate}
        onNavigate={onDateChange}
        
        // Interactive features
        selectable={true}
        onSelectSlot={handleSlotSelect}
        onSelectEvent={handleEventSelect}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        draggableAccessor={() => true}
        resizable={true}
        
        components={{
          event: CalendarEventComponent,
          toolbar: () => null, // We use custom toolbar
          week: {
            header: CalendarDayHeader
          },
          work_week: {
            header: CalendarDayHeader
          },
          month: {
            dateHeader: MonthDateHeader
          },
          day: {
            header: CalendarDayHeader
          }
        }}
        eventPropGetter={eventStyleGetter}
        dayPropGetter={dayPropGetter}
        min={new Date(0, 0, 0, 0, 0, 0)}
        max={new Date(0, 0, 0, 23, 59, 59)}
        step={30}
        timeslots={2}
        formats={getCalendarFormats()}
        className={cn(
          "automi-calendar text-xs sm:text-sm md:text-base",
          className
        )}
      />
    </div>
  )
})

CalendarGrid.displayName = 'CalendarGrid'