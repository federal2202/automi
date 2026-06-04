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
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
      <div className="text-[11px] text-[#10b981] font-['Plus_Jakarta_Sans'] whitespace-nowrap">
        {moment(currentDate).format('MMMM YYYY').toUpperCase()}
      </div>

      <div className="bg-[#0e0e0e] border border-[rgba(59,75,53,0.15)] rounded-full flex items-center p-[3px]">
        <button
          onClick={() => onNavigate('prev')}
          className="p-1 hover:bg-[rgba(59,75,53,0.2)] rounded-full transition-colors"
        >
          <ChevronLeft className="w-3 h-3 text-white" />
        </button>
        <button
          onClick={() => onNavigate('next')}
          className="p-1 hover:bg-[rgba(59,75,53,0.2)] rounded-full transition-colors"
        >
          <ChevronRight className="w-3 h-3 text-white" />
        </button>
      </div>

      <div className="bg-[#0e0e0e] border border-[rgba(59,75,53,0.15)] rounded-full flex items-center p-[2px]">
        {getAvailableViews().map((viewType) => (
          <button
            key={viewType}
            onClick={() => onViewChange(viewType)}
            className={cn(
              'px-3 py-1 text-[10px] font-bold tracking-wide uppercase transition-all duration-200 rounded-full',
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
