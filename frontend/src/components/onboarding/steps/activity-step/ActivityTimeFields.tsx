"use client"

import { cn } from '@/utils/cn'
import { ScheduleEntry } from '@/types/activity'
import { SharedTimeFields } from './SharedTimeFields'
import { PerDayTimeFields } from './PerDayTimeFields'

interface ActivityTimeFieldsProps {
  errorRegionId: string
  hasError: boolean
  isSubmitting: boolean
  schedule: ScheduleEntry[]
  sortedEntries: ScheduleEntry[]
  sameTimeForAll: boolean
  sharedStart: string
  sharedEnd: string
  handleSameTimeToggle: (next: boolean) => void
  updateSharedStart: (value: string) => void
  updateSharedEnd: (value: string) => void
  updateEntryStart: (dow: number, value: string) => void
  updateEntryEnd: (dow: number, value: string) => void
}

/** "Same time for all" toggle plus the matching time inputs. */
export function ActivityTimeFields(props: ActivityTimeFieldsProps) {
  const { isSubmitting, sameTimeForAll, handleSameTimeToggle } = props
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
          onChange={(e) => handleSameTimeToggle(e.target.checked)}
          disabled={isSubmitting}
          className="h-4 w-4 rounded border-white/20 bg-white/5 accent-green-nice"
        />
        Same time for all selected days
      </label>

      {sameTimeForAll ? (
        <SharedTimeFields
          errorRegionId={props.errorRegionId}
          hasError={props.hasError}
          isSubmitting={isSubmitting}
          disabled={props.schedule.length === 0}
          sharedStart={props.sharedStart}
          sharedEnd={props.sharedEnd}
          updateSharedStart={props.updateSharedStart}
          updateSharedEnd={props.updateSharedEnd}
        />
      ) : (
        <PerDayTimeFields
          errorRegionId={props.errorRegionId}
          hasError={props.hasError}
          isSubmitting={isSubmitting}
          sortedEntries={props.sortedEntries}
          updateEntryStart={props.updateEntryStart}
          updateEntryEnd={props.updateEntryEnd}
        />
      )}
    </div>
  )
}
