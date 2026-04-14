import React from 'react'
import moment from 'moment'
import { cn } from '@/utils/cn'
import { CalendarEventProps } from '../types/calendar.types'
import { getEventStyles } from '../utils/calendarStyles'

/**
 * CalendarEvent Component
 * Extracted from the original CustomEvent inline component
 * Renders events with different styling based on type
 */
export const CalendarEvent = React.memo(({ event }: CalendarEventProps) => {
  const getEventTypeStyles = (type: string) => {
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
      getEventTypeStyles(event.type)
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
})

CalendarEvent.displayName = 'CalendarEvent'