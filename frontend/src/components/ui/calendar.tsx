"use client"

import { useState } from 'react'
import { Calendar as BigCalendar, momentLocalizer, View, Views } from 'react-big-calendar'
import moment from 'moment'
import { cn } from '@/utils/cn'
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: 'primary' | 'secondary' | 'critical' | 'inactive'
  description?: string
}

// Generate sample events for the current week (timezone-aware)
const generateSampleEvents = (): CalendarEvent[] => {
  const now = moment() // Uses local timezone automatically
  const currentWeekStart = now.clone().startOf('week')
  
  return [
    {
      id: '1',
      title: 'Core Infrastructure Review',
      start: moment(currentWeekStart).day(1).hour(9).minute(0).toDate(), // Monday 9:00
      end: moment(currentWeekStart).day(1).hour(11).minute(30).toDate(), // Monday 11:30
      type: 'primary',
      description: 'Evaluate node latency across main clusters.'
    },
    {
      id: '2',
      title: 'Stakeholder Sync',
      start: moment(currentWeekStart).day(1).hour(14).minute(0).toDate(), // Monday 14:00
      end: moment(currentWeekStart).day(1).hour(15).minute(30).toDate(), // Monday 15:30
      type: 'secondary',
      description: 'Visual presentation of v2.0 roadmap.'
    },
    {
      id: '3',
      title: 'Design Sprint',
      start: moment(currentWeekStart).day(2).hour(10).minute(0).toDate(), // Tuesday 10:00
      end: moment(currentWeekStart).day(2).hour(12).minute(0).toDate(), // Tuesday 12:00
      type: 'secondary',
      description: 'Prototyping advanced grid layouts.'
    },
    {
      id: '4',
      title: 'Documentation',
      start: moment(currentWeekStart).day(2).hour(16).minute(0).toDate(), // Tuesday 16:00
      end: moment(currentWeekStart).day(2).hour(17).minute(0).toDate(), // Tuesday 17:00
      type: 'inactive'
    },
    {
      id: '5',
      title: 'CRITICAL DEPLOYMENT',
      start: moment(currentWeekStart).day(3).hour(9).minute(0).toDate(), // Wednesday 9:00
      end: moment(currentWeekStart).day(3).hour(13).minute(0).toDate(), // Wednesday 13:00
      type: 'critical',
      description: 'Monitoring active telemetry.'
    },
    {
      id: '6',
      title: 'Security Audit',
      start: moment(currentWeekStart).day(3).hour(15).minute(30).toDate(), // Wednesday 15:30
      end: moment(currentWeekStart).day(3).hour(17).minute(0).toDate(), // Wednesday 17:00
      type: 'primary'
    },
    {
      id: '7',
      title: 'Mentorship Hour',
      start: moment(currentWeekStart).day(4).hour(8).minute(0).toDate(), // Thursday 8:00
      end: moment(currentWeekStart).day(4).hour(10).minute(0).toDate(), // Thursday 10:00
      type: 'primary'
    },
    {
      id: '8',
      title: 'Product Workshop',
      start: moment(currentWeekStart).day(4).hour(11).minute(0).toDate(), // Thursday 11:00
      end: moment(currentWeekStart).day(4).hour(14).minute(0).toDate(), // Thursday 14:00
      type: 'secondary',
      description: 'Deep dive into user behavioral data.'
    },
    {
      id: '9',
      title: 'UI QA',
      start: moment(currentWeekStart).day(4).hour(15).minute(0).toDate(), // Thursday 15:00
      end: moment(currentWeekStart).day(4).hour(16).minute(30).toDate(), // Thursday 16:30
      type: 'secondary'
    },
    {
      id: '10',
      title: 'Weekly Wrap-up',
      start: moment(currentWeekStart).day(5).hour(9).minute(0).toDate(), // Friday 9:00
      end: moment(currentWeekStart).day(5).hour(11).minute(0).toDate(), // Friday 11:00
      type: 'primary'
    },
    {
      id: '11',
      title: 'System Maintenance',
      start: moment(currentWeekStart).day(5).hour(14).minute(0).toDate(), // Friday 14:00
      end: moment(currentWeekStart).day(5).hour(17).minute(0).toDate(), // Friday 17:00
      type: 'inactive'
    },
    {
      id: '12',
      title: 'Weekend Learning',
      start: moment(currentWeekStart).day(6).hour(10).minute(0).toDate(), // Saturday 10:00
      end: moment(currentWeekStart).day(6).hour(12).minute(0).toDate(), // Saturday 12:00
      type: 'secondary',
      description: 'Personal development and skill enhancement.'
    },
    {
      id: '13',
      title: 'Family Time',
      start: moment(currentWeekStart).day(0).hour(14).minute(0).toDate(), // Sunday 14:00
      end: moment(currentWeekStart).day(0).hour(16).minute(0).toDate(), // Sunday 16:00
      type: 'primary',
      description: 'Quality time with family and friends.'
    },
    {
      id: '14',
      title: 'Project Planning',
      start: moment(currentWeekStart).day(0).hour(19).minute(0).toDate(), // Sunday 19:00
      end: moment(currentWeekStart).day(0).hour(20).minute(30).toDate(), // Sunday 20:30
      type: 'secondary',
      description: 'Plan upcoming week and set priorities.'
    }
  ]
}

interface WeeklyCalendarProps {
  className?: string
}

export default function WeeklyCalendar({ className }: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date()) // Use current date
  const [view, setView] = useState<View>(Views.WEEK) // Changed from WORK_WEEK to WEEK for 7 days
  const sampleEvents = generateSampleEvents() // Generate events for current week

  const getAvailableViews = () => {
    return [Views.DAY, Views.WEEK, Views.MONTH]
  }

  const getViewLabel = (viewType: View) => {
    switch (viewType) {
      case Views.DAY: return 'DAY'
      case Views.WEEK: return 'WEEK'
      case Views.WORK_WEEK: return 'WORK'
      case Views.MONTH: return 'MONTH'
      default: return 'WEEK'
    }
  }

  const CustomEvent = ({ event }: { event: CalendarEvent }) => {
    const getEventStyles = (type: string) => {
      switch (type) {
        case 'primary':
          return 'bg-[rgba(6,78,59,0.1)] border-l-4 border-[#065f46] text-[#059669]'
        case 'secondary':
          return 'bg-[rgba(111,0,190,0.1)] border-l-4 border-[#ddb7ff] text-[#ddb7ff]'
        case 'critical':
          return 'bg-[rgba(6,78,59,0.6)] border border-[rgba(6,95,70,0.3)] text-[#a7f3d0]'
        case 'inactive':
          return 'bg-[#1c1b1b] border border-[rgba(59,75,53,0.15)] text-[#6b7280] opacity-60'
        default:
          return 'bg-[rgba(6,78,59,0.1)] border-l-4 border-[#065f46] text-[#059669]'
      }
    }

    const formatTime = (date: Date) => {
      return moment(date).format('HH:mm')
    }

    return (
      <div className={cn(
        "w-full h-full rounded-2xl p-4 flex flex-col gap-1",
        getEventStyles(event.type)
      )}>
        <div className="text-[10px] font-bold tracking-wide uppercase text-[#059669]">
          {event.id === '5' ? 'NOW - 13:00' : `${formatTime(event.start)} - ${formatTime(event.end)}`}
        </div>
        <div className={cn(
          "text-sm font-bold text-[#e5e2e1] font-['Plus_Jakarta_Sans']",
          event.type === 'critical' ? 'uppercase text-[#ecfdf5] font-extrabold' : '',
          event.type === 'inactive' ? 'text-[rgba(229,226,225,0.6)]' : ''
        )}>
          {event.title}
        </div>
        {event.description && (
          <div className={cn(
            "text-xs font-normal text-[#6b7280] font-['Plus_Jakarta_Sans'] leading-relaxed",
            event.type === 'critical' ? 'text-[#ecfdf5] font-medium italic opacity-80' : ''
          )}>
            {event.description}
          </div>
        )}
      </div>
    )
  }

  const CustomToolbar = () => {
    const navigateCalendar = (direction: 'prev' | 'next') => {
      const amount = direction === 'prev' ? -1 : 1
      let unit: moment.unitOfTime.DurationConstructor = 'week'
      
      if (view === Views.DAY) unit = 'day'
      else if (view === Views.MONTH) unit = 'month'
      else if (view === Views.WEEK || view === Views.WORK_WEEK) unit = 'week'
      
      setCurrentDate(moment(currentDate).add(amount, unit).toDate())
    }

    const getTitle = () => {
      switch (view) {
        case Views.DAY:
          return 'DAILY MANIFEST'
        case Views.MONTH:
          return 'MONTHLY MANIFEST'
        default:
          return 'WEEKLY MANIFEST'
      }
    }

    return (
      <>
        {/* Title Section with View Controls */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Mobile: Stack vertically, Desktop: Side by side */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl lg:text-[48px] font-bold text-[#e5e2e1] tracking-[-2.4px] uppercase leading-tight font-['Space_Grotesk']">
                {getTitle()}
              </h1>
              <p className="text-[10px] md:text-[11px] text-[#6b7280] tracking-[1.1px] uppercase font-['Plus_Jakarta_Sans']">
                PRECISION SCHEDULING PROTOCOL // CLUSTER 09-ALPHA
              </p>
            </div>
            
            {/* Controls: Date + Navigation + View Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              {/* Date Display */}
              <div className="text-[11px] text-[#10b981] font-['Plus_Jakarta_Sans'] whitespace-nowrap">
                {moment(currentDate).format('MMMM YYYY').toUpperCase()}
              </div>
              
              {/* Navigation */}
              <div className="bg-[#0e0e0e] border border-[rgba(59,75,53,0.15)] rounded-full flex items-center p-[3px]">
                <button 
                  onClick={() => navigateCalendar('prev')}
                  className="p-1 hover:bg-[rgba(59,75,53,0.2)] rounded-full transition-colors"
                >
                  <ChevronLeft className="w-3 h-3 text-white" />
                </button>
                <button 
                  onClick={() => navigateCalendar('next')}
                  className="p-1 hover:bg-[rgba(59,75,53,0.2)] rounded-full transition-colors"
                >
                  <ChevronRight className="w-3 h-3 text-white" />
                </button>
              </div>

              {/* View Switcher */}
              <div className="bg-[#0e0e0e] border border-[rgba(59,75,53,0.15)] rounded-full flex items-center p-[2px]">
                {getAvailableViews().map((viewType) => (
                  <button
                    key={viewType}
                    onClick={() => setView(viewType)}
                    className={cn(
                      "px-3 py-1 text-[10px] font-bold tracking-wide uppercase transition-all duration-200 rounded-full",
                      view === viewType
                        ? "bg-[#059669] text-white"
                        : "text-[#6b7280] hover:text-white hover:bg-[rgba(59,75,53,0.2)]"
                    )}
                  >
                    {getViewLabel(viewType)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const CustomDayHeader = ({ date, label }: { date: Date; label: string }) => {
    const isToday = moment(date).isSame(moment(), 'day')
    const dayNumber = moment(date).format('D')
    const dayName = label.toUpperCase()

    // Simple styling for all views
    return (
      <div className="flex flex-col items-center py-2">
        <div className={cn(
          "text-[10px] font-bold tracking-wide uppercase font-['Plus_Jakarta_Sans'] mb-1",
          isToday ? "text-[#059669]" : "text-white"
        )}>
          {dayName}
        </div>
        <div className={cn(
          "text-[20px] leading-5 font-['Space_Grotesk'] font-bold",
          isToday ? "text-[#059669]" : "text-white"
        )}>
          {dayNumber}
        </div>
        <div className={cn(
          "text-[9px] font-medium tracking-wider uppercase font-['Plus_Jakarta_Sans']",
          isToday ? "text-[#059669]" : "text-white"
        )}>
          {moment(date).format('MMM')}
        </div>
      </div>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: 'transparent',
        border: 'none',
        padding: 0,
        height: 'auto',
        minHeight: view === Views.MONTH ? '6px' : '120px'
      },
      className: `event-type-${event.type}`
    }
  }

  const dayPropGetter = (date: Date) => {
    const isToday = moment(date).isSame(moment(), 'day') // Check against actual current day
    return {
      style: {
        backgroundColor: isToday ? 'rgba(2,44,34,0.02)' : 'transparent'
      }
    }
  }

  return (
    <div className={cn("bg-[#0e0e0e] text-white h-full w-full flex flex-col p-4 md:p-6 lg:p-8", className)}>
      <div className="w-full flex-1 flex flex-col min-h-0 min-w-0">
        <BigCalendar
          localizer={localizer}
          events={sampleEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ 
            height: '100%',
            minHeight: '400px'
          }}
          view={view}
          onView={setView}
          views={getAvailableViews()}
          date={currentDate}
          onNavigate={setCurrentDate}
          components={{
            event: CustomEvent,
            toolbar: CustomToolbar,
            week: {
              header: CustomDayHeader
            },
            work_week: {
              header: CustomDayHeader
            },
            month: {
              dateHeader: ({ date }: { date: Date }) => {
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
            },
            day: {
              header: CustomDayHeader
            }
          }}
          eventPropGetter={eventStyleGetter}
          dayPropGetter={dayPropGetter}
          min={new Date(0, 0, 0, 0, 0, 0)}
          max={new Date(0, 0, 0, 23, 59, 59)}
          step={30}
          timeslots={2}
          formats={{
            timeGutterFormat: 'HH:mm',
            monthHeaderFormat: 'MMMM YYYY',
            dayHeaderFormat: 'ddd',
            dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) => {
              return `${moment(start).format('MMM D')} - ${moment(end).format('MMM D')}`
            }
          }}
          className={cn(
            "automi-calendar",
            "text-xs sm:text-sm md:text-base" // Responsive text sizing
          )}
        />
      </div>

      {/* Floating Chat Button - Hide on small screens */}
      <button className="hidden md:flex fixed bottom-8 right-8 w-14 h-14 bg-[#064e3b] border border-[rgba(4,120,87,0.3)] 
                        rounded-full items-center justify-center shadow-[0px_0px_20px_0px_rgba(6,78,59,0.4)]
                        hover:scale-105 transition-all duration-200">
        <MessageCircle className="w-5 h-5 text-white" />
      </button>
    </div>
  )
}

export { WeeklyCalendar }