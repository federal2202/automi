import { DAYS_OF_WEEK, ScheduleEntry, WEEK_DISPLAY_ORDER } from '@/types/activity'
import { cn } from '@/utils/cn'

interface DayPickerProps {
  schedule: ScheduleEntry[]
  onToggleDay: (dow: number) => void
  disabled?: boolean
  hasError: boolean
  errorRegionId: string
}

export function DayPicker({
  schedule,
  onToggleDay,
  disabled,
  hasError,
  errorRegionId,
}: DayPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <span
        id="activity-days-label"
        className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
      >
        Days of Week
      </span>
      <div
        role="group"
        aria-labelledby="activity-days-label"
        aria-describedby={hasError ? errorRegionId : undefined}
        className="flex flex-wrap gap-2"
      >
        {WEEK_DISPLAY_ORDER.map((dow) => {
          const isActive = schedule.some((e) => e.dayOfWeek === dow)
          return (
            <button
              key={dow}
              type="button"
              onClick={() => onToggleDay(dow)}
              disabled={disabled}
              aria-pressed={isActive}
              className={cn(
                'min-w-[44px] rounded-full border px-3 py-1.5 text-xs font-bold',
                'font-space-grotesk uppercase tracking-wide transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-green-nice/60',
                isActive
                  ? 'bg-green-nice border-green-nice text-white'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white',
                disabled && 'opacity-50 cursor-not-allowed'
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
