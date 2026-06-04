"use client"

import { memo } from 'react'
import { CalendarToolbarProps } from '@/types/calendar/calendar.types'
import { getCalendarTitle } from '@/utils/calendar/dateUtils'
import { ToolbarControls } from './ToolbarControls'

/**
 * CalendarToolbar Component
 * Renders title, navigation controls, and view switcher.
 */
export const CalendarToolbar = memo(
  ({
    currentDate,
    view,
    onNavigate,
    onViewChange,
  }: CalendarToolbarProps) => {
    return (
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl lg:text-[48px] font-bold text-[#e5e2e1] tracking-[-2.4px] uppercase leading-tight font-['Space_Grotesk']">
              {getCalendarTitle(view)}
            </h1>
            <p className="text-[10px] md:text-[11px] text-[#6b7280] tracking-[1.1px] uppercase font-['Plus_Jakarta_Sans']">
              PRECISION SCHEDULING PROTOCOL // CLUSTER 09-ALPHA
            </p>
          </div>

          <ToolbarControls
            currentDate={currentDate}
            view={view}
            onNavigate={onNavigate}
            onViewChange={onViewChange}
          />
        </div>
      </div>
    )
  }
)

CalendarToolbar.displayName = 'CalendarToolbar'
