import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DAYS_OF_WEEK_LONG, ScheduleEntry } from '@/types/activity'

interface PerDayTimeFieldsProps {
  sortedEntries: ScheduleEntry[]
  onEntryStartChange: (dow: number, value: string) => void
  onEntryEndChange: (dow: number, value: string) => void
  disabled?: boolean
  hasError: boolean
  errorRegionId: string
}

export function PerDayTimeFields({
  sortedEntries,
  onEntryStartChange,
  onEntryEndChange,
  disabled,
  hasError,
  errorRegionId,
}: PerDayTimeFieldsProps) {
  return (
    <div className="flex flex-col gap-2">
      {sortedEntries.length === 0 && (
        <p className="text-white/50 text-xs font-jakarta">
          Select at least one day above to configure times.
        </p>
      )}
      {sortedEntries.map((entry) => {
        const startId = `activity-start-${entry.dayOfWeek}`
        const endId = `activity-end-${entry.dayOfWeek}`
        return (
          <div
            key={entry.dayOfWeek}
            className="grid grid-cols-[80px_1fr_1fr] items-center gap-3"
          >
            <span className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta">
              {DAYS_OF_WEEK_LONG[entry.dayOfWeek]}
            </span>
            <div className="flex flex-col gap-1">
              <Label htmlFor={startId} className="sr-only">
                Start time for {DAYS_OF_WEEK_LONG[entry.dayOfWeek]}
              </Label>
              <Input
                id={startId}
                type="time"
                value={entry.startTime}
                max={entry.endTime || undefined}
                onChange={(e) =>
                  onEntryStartChange(entry.dayOfWeek, e.target.value)
                }
                disabled={disabled}
                aria-invalid={hasError || undefined}
                aria-describedby={hasError ? errorRegionId : undefined}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor={endId} className="sr-only">
                End time for {DAYS_OF_WEEK_LONG[entry.dayOfWeek]}
              </Label>
              <Input
                id={endId}
                type="time"
                value={entry.endTime}
                min={entry.startTime || undefined}
                onChange={(e) =>
                  onEntryEndChange(entry.dayOfWeek, e.target.value)
                }
                disabled={disabled}
                aria-invalid={hasError || undefined}
                aria-describedby={hasError ? errorRegionId : undefined}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
