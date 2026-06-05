'use client'

import { memo } from 'react'
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import moment from 'moment'
import { cn } from '@/utils/cn'
import { CalendarEvent, CalendarView } from '@/types/calendar/calendar.types'
import { getAvailableViews, getCalendarFormats } from '@/utils/calendar/dateUtils'
import { getDayProps, getEventStyle } from './calendar-grid.utils'
import { useCalendarGridHandlers } from './useCalendarGridHandlers'
import { buildCalendarComponents, useEventComponents } from './useEventComponents'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import '@/styles/calendar.css'

const localizer = momentLocalizer(moment)
const DragAndDropCalendar = withDragAndDrop<CalendarEvent>(BigCalendar)

interface CalendarGridProps {
  currentDate: Date
  view: CalendarView
  events: CalendarEvent[]
  onViewChange: (view: CalendarView) => void
  onDateChange: (date: Date) => void
  className?: string
  /**
   * Optional one-shot entry-animation map: eventId -> stagger index.
   * When present each event runs the `event-enter` keyframe with
   * `animation-delay: index * 60ms`. When null, zero overhead.
   */
  staggerMap?: Map<string, number> | null
}

/**
 * CalendarGrid Component
 * BigCalendar wrapper with custom components and event handlers.
 */
export const CalendarGrid = memo(
  ({
    currentDate,
    view,
    events,
    onViewChange,
    onDateChange,
    className,
    staggerMap,
  }: CalendarGridProps) => {
    const handlers = useCalendarGridHandlers()
    const eventComponents = useEventComponents(staggerMap)

    return (
      <div className="w-full flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
        <DragAndDropCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%', minHeight: '400px' }}
          view={view}
          onView={onViewChange}
          views={getAvailableViews()}
          date={currentDate}
          onNavigate={onDateChange}
          selectable={true}
          onSelectSlot={handlers.handleSlotSelect}
          onSelectEvent={handlers.handleEventSelect}
          onEventDrop={handlers.handleEventDrop}
          onEventResize={handlers.handleEventResize}
          draggableAccessor={() => true}
          resizable={true}
          components={buildCalendarComponents(eventComponents)}
          eventPropGetter={(event) => getEventStyle(event, view)}
          dayPropGetter={getDayProps}
          min={new Date(0, 0, 0, 0, 0, 0)}
          max={new Date(0, 0, 0, 23, 59, 59)}
          step={30}
          timeslots={2}
          formats={getCalendarFormats()}
          className={cn(
            'automi-calendar text-xs sm:text-sm md:text-base',
            className
          )}
        />
      </div>
    )
  }
)

CalendarGrid.displayName = 'CalendarGrid'
