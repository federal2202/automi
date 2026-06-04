"use client"

import { memo, useCallback } from 'react'
import { RecurringActivity } from '@/types/activity'
import { cn } from '@/utils/cn'
import { CardActions } from './recurring-activity-card/CardActions'
import { CardSchedule } from './recurring-activity-card/CardSchedule'
import {
  allEntriesShareTimes,
  sortScheduleForDisplay,
} from './recurring-activity-card/RecurringActivityCard.utils'

interface RecurringActivityCardProps {
  activity: RecurringActivity
  onEdit: (activity: RecurringActivity) => void
  onDelete: (activity: RecurringActivity) => void
  disabled?: boolean
  /**
   * When set (0-6), the card is being rendered inside a specific weekday
   * bucket. In that case the schedule line shows only that day's start/end
   * time instead of the full multi-day schedule.
   */
  dayContext?: number
}

function RecurringActivityCardImpl({
  activity,
  onEdit,
  onDelete,
  disabled,
  dayContext,
}: RecurringActivityCardProps) {
  const handleEdit = useCallback(() => onEdit(activity), [onEdit, activity])
  const handleDelete = useCallback(
    () => onDelete(activity),
    [onDelete, activity]
  )

  const sortedEntries = sortScheduleForDisplay(activity.schedule)

  // When rendered inside a specific weekday bucket, show only that day's
  // time slot. Falls back to the multi-day display if no matching entry is
  // found (defensive — bucketing on the parent should guarantee a match).
  const contextEntry =
    typeof dayContext === 'number'
      ? activity.schedule.find((e) => e.dayOfWeek === dayContext)
      : undefined

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm transition-colors',
        'hover:bg-white/[0.08] sm:flex-row sm:items-center sm:justify-between'
      )}
    >
      <div className="flex flex-col gap-1 min-w-0">
        <h4 className="font-space-grotesk text-base font-semibold leading-tight text-text-primary line-clamp-2">
          {activity.title}
        </h4>
        <CardSchedule
          sortedEntries={sortedEntries}
          contextEntry={contextEntry}
          allSameTimes={allEntriesShareTimes(sortedEntries)}
        />
      </div>

      <CardActions
        title={activity.title}
        onEdit={handleEdit}
        onDelete={handleDelete}
        disabled={disabled}
      />
    </div>
  )
}

export const RecurringActivityCard = memo(RecurringActivityCardImpl)
