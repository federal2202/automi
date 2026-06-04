"use client"

import { CalendarToolbarProps } from '@/types/calendar/calendar.types'

type ToolbarCalendar = NonNullable<CalendarToolbarProps['calendars']>[number]

interface CalendarSelectorProps {
  calendars: ToolbarCalendar[]
}

/**
 * CalendarSelector — dropdown to pick a Google calendar.
 * Only rendered when more than one calendar is available.
 */
export function CalendarSelector({ calendars }: CalendarSelectorProps) {
  if (calendars.length <= 1) return null

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-[#6b7280] tracking-wide uppercase font-['Plus_Jakarta_Sans']">
        Calendar:
      </span>
      <select className="bg-[#0e0e0e] border border-[rgba(59,75,53,0.15)] rounded-lg px-3 py-2 text-[11px] text-white font-['Plus_Jakarta_Sans'] focus:outline-none focus:border-[#059669]">
        {calendars.map((calendar) => (
          <option key={calendar.id} value={calendar.id}>
            {calendar.summary} {calendar.primary ? '(Primary)' : ''}
          </option>
        ))}
      </select>
    </div>
  )
}
