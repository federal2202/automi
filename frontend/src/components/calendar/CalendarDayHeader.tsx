import { memo } from 'react'
import moment from 'moment'
import { cn } from '@/utils/cn'
import { CalendarDayHeaderProps } from '@/types/calendar/calendar.types'

/**
 * CalendarDayHeader Component
 * Extracted from the original CustomDayHeader inline component
 * Renders day headers with date, day name, and today highlighting
 */
export const CalendarDayHeader = memo(({ date, label }: CalendarDayHeaderProps) => {
  const isToday = moment(date).isSame(moment(), 'day')
  const dayNumber = moment(date).format('D')
  const dayName = label.toUpperCase()

  // Simple styling for all views (matches current simplified implementation)
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
})

CalendarDayHeader.displayName = 'CalendarDayHeader'