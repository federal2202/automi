import React from 'react'
import { cn } from '@/utils/cn'
import { CalendarEventProps } from '../types/calendar.types'

/**
 * CalendarEvent Component
 * Duration-proportional events with responsive compact styling
 * Events maintain their natural height based on duration while becoming
 * more compact on smaller screens through reduced padding, fonts, and spacing
 */
export const CalendarEvent = React.memo(({ event }: CalendarEventProps) => {
  const getEventTypeStyles = (type: string) => {
    switch (type) {
      case 'primary':
        return 'bg-green-500/10 text-green-400'
      case 'secondary':
        return 'bg-purple-500/10 text-purple-400'
      case 'critical':
        return 'bg-red-500/10 text-red-400'
      case 'inactive':
        return 'bg-white/10 text-white'
      default:
        return 'bg-green-500/10 text-green-400'
    }
  }

  return (
    <div className={cn(
      // Base styles - full width/height to preserve duration scaling - NO BORDERS
      "w-full h-full rounded-sm flex flex-col border-none",
      // Ultra responsive padding: ultra-compact on mobile, slightly larger on desktop
      "p-px sm:p-0.5 md:p-1 lg:p-2",
      // Ultra responsive gaps: no gap on mobile, minimal on larger screens  
      "gap-0 sm:gap-px md:gap-0.5",
      getEventTypeStyles(event.type)
    )}>
      <div className={cn(
        "font-semibold truncate",
        // Responsive font sizes: very small on mobile, larger on desktop
        "text-[10px] sm:text-xs md:text-xs",
        // Responsive line heights: very tight on mobile
        "leading-none sm:leading-tight md:leading-tight"
      )}>
        {event.title}
      </div>
      {event.description && (
        <div className={cn(
          "font-normal opacity-80 truncate",
          // Even smaller description text, progressively larger
          "text-[8px] sm:text-[10px] md:text-xs",
          // Very tight line height for descriptions
          "leading-none"
        )}>
          {event.description}
        </div>
      )}
    </div>
  )
})

CalendarEvent.displayName = 'CalendarEvent'