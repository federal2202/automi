"use client"

import { cn } from '@/utils/cn'
import { DAYS_OF_WEEK, ScheduleEntry, WEEK_DISPLAY_ORDER } from '@/types/activity'

interface ActivityDayPickerProps {
  errorRegionId: string
  hasError: boolean
  isSubmitting: boolean
  schedule: ScheduleEntry[]
  toggleDay: (dow: number) => void
}

/** Weekday chip group driving the activity step's `schedule[]`. */
export function ActivityDayPicker({
  errorRegionId,
  hasError,
  isSubmitting,
  schedule,
  toggleDay,
}: ActivityDayPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <span
        id="onboarding-activity-days-label"
        className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
      >
        Days of Week
      </span>
      <div
        role="group"
        aria-labelledby="onboarding-activity-days-label"
        aria-describedby={hasError ? errorRegionId : undefined}
        className="flex flex-wrap gap-2"
      >
        {WEEK_DISPLAY_ORDER.map((dow) => {
          const isActive = schedule.some((e) => e.dayOfWeek === dow)
          return (
            <button
              key={dow}
              type="button"
              onClick={() => toggleDay(dow)}
              disabled={isSubmitting}
              aria-pressed={isActive}
              className={cn(
                'min-w-[44px] rounded-full border px-3 py-1.5 text-xs font-bold',
                'font-space-grotesk uppercase tracking-wide transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-green-nice/60',
                isActive
                  ? 'bg-green-nice border-green-nice text-white'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white',
                isSubmitting && 'opacity-50 cursor-not-allowed'
              )}
            >
              {DAYS_OF_WEEK[dow]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
