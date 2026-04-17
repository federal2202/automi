'use client'

import { memo } from 'react'
import moment from 'moment'
import { Views } from 'react-big-calendar'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { CalendarToolbarProps } from '../types/calendar.types'
import { getCalendarTitle, getViewLabel, getAvailableViews } from '../utils/dateUtils'

/**
 * CalendarToolbar Component
 * Extracted from the original CustomToolbar inline component
 * Renders title, navigation controls, and view switcher
 */
export const CalendarToolbar = memo(({ 
  currentDate, 
  view, 
  onNavigate, 
  onViewChange 
}: CalendarToolbarProps) => {
  
  const getTitle = () => getCalendarTitle(view)

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

            {/* View Switcher */}
            <div className="bg-[#0e0e0e] border border-[rgba(59,75,53,0.15)] rounded-full flex items-center p-[2px]">
              {getAvailableViews().map((viewType) => (
                <button
                  key={viewType}
                  onClick={() => onViewChange(viewType)}
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
})

CalendarToolbar.displayName = 'CalendarToolbar'