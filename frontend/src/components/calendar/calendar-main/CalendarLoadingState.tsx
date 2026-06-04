'use client'

import { cn } from '@/utils/cn'
import { Loader } from '@/components/shared/Loader'

interface CalendarLoadingStateProps {
  isUsingGoogleCalendar: boolean
  className?: string
}

/**
 * Branded loading view for the calendar (sidebar remains visible/usable).
 */
export function CalendarLoadingState({
  isUsingGoogleCalendar,
  className,
}: CalendarLoadingStateProps) {
  return (
    <div
      className={cn(
        'bg-[#0e0e0e] text-white h-full w-full flex flex-col items-center justify-center p-8',
        className
      )}
    >
      <Loader
        size="lg"
        label={
          isUsingGoogleCalendar
            ? 'LOADING CALENDAR // SYNCING EVENTS'
            : 'LOADING CALENDAR'
        }
      />
    </div>
  )
}
