"use client"

import moment from 'moment'
import { cn } from '@/utils/cn'
import { CalendarEvent } from '@/types/calendar/calendar.types'

/**
 * Month view date header — minimalistic, top-left, today in brand green.
 */
export const MonthDateHeader = ({ date }: { date: Date }) => {
  const isToday = moment(date).isSame(moment(), 'day')
  return (
    <div className="flex justify-start">
      <span
        className={cn(
          'inline-flex items-center justify-center text-[12px] font-medium leading-none',
          isToday
            ? 'min-w-[22px] h-[22px] px-1.5 rounded-full bg-[var(--green-nice)] text-white font-semibold'
            : 'text-[rgba(229,226,225,0.55)]'
        )}
      >
        {moment(date).format('D')}
      </span>
    </div>
  )
}

/**
 * Month-view event renderer — just the title; chip styling lives on .rbc-event.
 */
export const MonthEvent = ({ event }: { event: CalendarEvent }) => (
  <span className="block truncate text-[11px] font-medium leading-tight">
    {event.title}
  </span>
)
