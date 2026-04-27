'use client'

import { memo, useCallback } from 'react'
import { Calendar as BigCalendar, momentLocalizer, SlotInfo } from 'react-big-calendar'
import withDragAndDrop, { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop'
import moment from 'moment'
import { cn } from '@/utils/cn'
import { CalendarEvent, CalendarView } from '@/types/calendar/calendar.types'
import { CalendarEvent as CalendarEventComponent } from './CalendarEvent'
import { CalendarDayHeader } from './CalendarDayHeader'
import { getAvailableViews, getCalendarFormats } from '@/utils/calendar/dateUtils'
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
export const CalendarGrid = memo(({ 
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
    // For month view, let CSS handle the chip styling (don't override).
    if (view === 'month') {
      return {
        className: `event-type-${event.type}`
      }
    }
    return {
      style: {
        backgroundColor: 'transparent',
        border: 'none',
        padding: 0,
        height: 'auto'
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

  // Month view date header component — minimalistic, top-left, today in brand green
  const MonthDateHeader = ({ date }: { date: Date }) => {
    const isToday = moment(date).isSame(moment(), 'day')
    return (
      <div className="flex justify-start">
        <span
          className={cn(
            "inline-flex items-center justify-center text-[12px] font-medium leading-none",
            isToday
              ? "min-w-[22px] h-[22px] px-1.5 rounded-full bg-[var(--green-nice)] text-white font-semibold"
              : "text-[rgba(229,226,225,0.55)]"
          )}
        >
          {moment(date).format('D')}
        </span>
      </div>
    )
  }

  // Month-view event renderer — just the title, the chip styling lives on .rbc-event
  const MonthEvent = ({ event }: { event: CalendarEvent }) => (
    <span className="block truncate text-[11px] font-medium leading-tight">
      {event.title}
    </span>
  )

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
            dateHeader: MonthDateHeader,
            event: MonthEvent
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