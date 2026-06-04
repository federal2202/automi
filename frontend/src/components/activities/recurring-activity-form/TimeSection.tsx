import { ScheduleEntry } from '@/types/activity'
import { cn } from '@/utils/cn'
import { PerDayTimeFields } from './PerDayTimeFields'
import { SharedTimeFields } from './SharedTimeFields'

interface TimeSectionProps {
  sameTimeForAll: boolean
  onSameTimeToggle: (next: boolean) => void
  schedule: ScheduleEntry[]
  sortedEntries: ScheduleEntry[]
  sharedStart: string
  sharedEnd: string
  onSharedStartChange: (value: string) => void
  onSharedEndChange: (value: string) => void
  onEntryStartChange: (dow: number, value: string) => void
  onEntryEndChange: (dow: number, value: string) => void
  isSubmitting?: boolean
  hasError: boolean
  errorRegionId: string
}

export function TimeSection({
  sameTimeForAll,
  onSameTimeToggle,
  schedule,
  sortedEntries,
  sharedStart,
  sharedEnd,
  onSharedStartChange,
  onSharedEndChange,
  onEntryStartChange,
  onEntryEndChange,
  isSubmitting,
  hasError,
  errorRegionId,
}: TimeSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <label
        className={cn(
          'flex items-center gap-2 text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta select-none',
          isSubmitting && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          type="checkbox"
          checked={sameTimeForAll}
          onChange={(e) => onSameTimeToggle(e.target.checked)}
          disabled={isSubmitting}
          className="h-4 w-4 rounded border-white/20 bg-white/5 accent-green-nice"
        />
        Same time for all selected days
      </label>

      {sameTimeForAll ? (
        <SharedTimeFields
          sharedStart={sharedStart}
          sharedEnd={sharedEnd}
          onStartChange={onSharedStartChange}
          onEndChange={onSharedEndChange}
          disabled={isSubmitting || schedule.length === 0}
          hasError={hasError}
          errorRegionId={errorRegionId}
        />
      ) : (
        <PerDayTimeFields
          sortedEntries={sortedEntries}
          onEntryStartChange={onEntryStartChange}
          onEntryEndChange={onEntryEndChange}
          disabled={isSubmitting}
          hasError={hasError}
          errorRegionId={errorRegionId}
        />
      )}
    </div>
  )
}
