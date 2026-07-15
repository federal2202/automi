"use client"

import moment from 'moment'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { CalendarView } from '@/types/calendar/calendar.types'
import { getViewLabel, getAvailableViews } from '@/utils/calendar/dateUtils'

interface ToolbarControlsProps {
  currentDate: Date
  view: CalendarView
  onNavigate: (direction: 'prev' | 'next') => void
  onViewChange: (view: CalendarView) => void
}

/**
 * ToolbarControls — date display, prev/next navigation, and view switcher.
 */
export function ToolbarControls({
  currentDate,
  view,
  onNavigate,
  onViewChange,
}: ToolbarControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between sm:justify-start gap-x-2 gap-y-2 sm:gap-x-4">
      {/* Month/year label + prev/next, combined into one pill so the whole
          nav control reads as a single unit on narrow screens instead of
          three separate rows stacked in a column. */}
      <div className="flex items-center gap-1 sm:gap-1.5 bg-[#0e0e0e] border border-[rgba(59,75,53,0.15)] rounded-full py-[3px] pl-3 pr-[3px] min-w-0">
        <span className="text-[10px] sm:text-[11px] text-[#10b981] font-['Plus_Jakarta_Sans'] whitespace-nowrap truncate">
          <span className="sm:hidden">{moment(currentDate).format('MMM YYYY').toUpperCase()}</span>
          <span className="hidden sm:inline">{moment(currentDate).format('MMMM YYYY').toUpperCase()}</span>
        </span>
        <div className="flex items-center shrink-0">
          <button
            onClick={() => onNavigate('prev')}
            aria-label="Previous"
            className="p-1 hover:bg-[rgba(59,75,53,0.2)] rounded-full transition-colors"
          >
            <ChevronLeft className="w-3 h-3 text-white" />
          </button>
          <button
            onClick={() => onNavigate('next')}
            aria-label="Next"
            className="p-1 hover:bg-[rgba(59,75,53,0.2)] rounded-full transition-colors"
          >
            <ChevronRight className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>

      <div className="bg-[#0e0e0e] border border-[rgba(59,75,53,0.15)] rounded-full flex items-center p-[2px] shrink-0">
        {getAvailableViews().map((viewType) => (
          <button
            key={viewType}
            onClick={() => onViewChange(viewType)}
            className={cn(
              'px-1.5 sm:px-3 py-1 text-[9px] sm:text-[10px] font-bold tracking-wide uppercase transition-all duration-200 rounded-full',
              view === viewType
                ? 'bg-[#059669] text-white'
                : 'text-[#6b7280] hover:text-white hover:bg-[rgba(59,75,53,0.2)]'
            )}
          >
            {getViewLabel(viewType)}
          </button>
        ))}
      </div>
    </div>
  )
}
