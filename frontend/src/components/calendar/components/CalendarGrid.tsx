import React from 'react'
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import { cn } from '@/utils/cn'
import { CalendarEvent, CalendarView } from '../types/calendar.types'
import { CalendarEvent as CalendarEventComponent } from './CalendarEvent'
import { CalendarDayHeader } from './CalendarDayHeader'
import { getAvailableViews, getCalendarFormats } from '../utils/dateUtils'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

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
 * BigCalendar wrapper with custom components
 */
export const CalendarGrid = React.memo(({ 
  currentDate, 
  view, 
  events, 
  onViewChange, 
  onDateChange, 
  className 
}: CalendarGridProps) => {
  
  // Event style getter - preserves exact styling from original
  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: 'transparent',
        border: 'none',
        padding: 0,
        height: 'auto',
        minHeight: view === 'month' ? '6px' : '120px'
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
    <div className="w-full flex-1 flex flex-col min-h-0 min-w-0">
      <BigCalendar
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