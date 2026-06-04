"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DAYS_OF_WEEK_LONG, ScheduleEntry } from '@/types/activity'

interface PerDayTimeFieldsProps {
  errorRegionId: string
  hasError: boolean
  isSubmitting: boolean
  sortedEntries: ScheduleEntry[]
  updateEntryStart: (dow: number, value: string) => void
  updateEntryEnd: (dow: number, value: string) => void
}

/** Per-weekday start/end rows ("different times" mode). */
export function PerDayTimeFields({
  errorRegionId,
  hasError,
  isSubmitting,
  sortedEntries,
  updateEntryStart,
  updateEntryEnd,
}: PerDayTimeFieldsProps) {
  const describedBy = hasError ? errorRegionId : undefined
  return (
    <div className="flex flex-col gap-2">
      {sortedEntries.length === 0 && (
        <p className="text-white/50 text-xs font-jakarta">
          Select at least one day above to configure times.
        </p>
      )}
      {sortedEntries.map((entry) => {
        const startId = `onboarding-activity-start-${entry.dayOfWeek}`
        const endId = `onboarding-activity-end-${entry.dayOfWeek}`
        const dayLabel = DAYS_OF_WEEK_LONG[entry.dayOfWeek]
        return (
          <div
            key={entry.dayOfWeek}
            className="grid grid-cols-[80px_1fr_1fr] items-center gap-3"
          >
            <span className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta">
              {dayLabel}
            </span>
            <div className="flex flex-col gap-1">
              <Label htmlFor={startId} className="sr-only">
                Start time for {dayLabel}
              </Label>
              <Input
                id={startId}
                type="time"
                value={entry.startTime}
                max={entry.endTime || undefined}
                onChange={(e) => updateEntryStart(entry.dayOfWeek, e.target.value)}
                disabled={isSubmitting}
                aria-invalid={hasError || undefined}
                aria-describedby={describedBy}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor={endId} className="sr-only">
                End time for {dayLabel}
              </Label>
              <Input
                id={endId}
                type="time"
                value={entry.endTime}
                min={entry.startTime || undefined}
                onChange={(e) => updateEntryEnd(entry.dayOfWeek, e.target.value)}
                disabled={isSubmitting}
                aria-invalid={hasError || undefined}
                aria-describedby={describedBy}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
