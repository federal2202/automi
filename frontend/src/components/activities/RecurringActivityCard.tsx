"use client"

import { memo, useCallback } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import {
  DAYS_OF_WEEK,
  RecurringActivity,
  WEEK_DISPLAY_ORDER,
} from '@/types/activity'
import { cn } from '@/utils/cn'

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

  // Sort schedule entries in Mon→Sun display order so rendered lines are
  // ordered consistently with the surrounding day-bucket sections.
  const sortedEntries = WEEK_DISPLAY_ORDER.flatMap((dow) =>
    activity.schedule.filter((e) => e.dayOfWeek === dow)
  )

  // When rendered inside a specific weekday bucket, show only that day's
  // time slot. Falls back to the multi-day display if no matching entry is
  // found (defensive — bucketing on the parent should guarantee a match).
  const contextEntry =
    typeof dayContext === 'number'
      ? activity.schedule.find((e) => e.dayOfWeek === dayContext)
      : undefined

  // Collapse to a single line when every entry shares identical times; this
  // is the common case (e.g. "Mon, Wed, Fri · 06:00–08:00").
  const allSameTimes =
    sortedEntries.length > 0 &&
    sortedEntries.every(
      (e) =>
        e.startTime === sortedEntries[0].startTime &&
        e.endTime === sortedEntries[0].endTime
    )

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
        {contextEntry ? (
          <p className="font-jakarta text-xs tracking-[0.5px] text-text-muted">
            <span className="text-white/80">
              {DAYS_OF_WEEK[contextEntry.dayOfWeek]}
            </span>
            <span className="mx-1 text-white/40">·</span>
            {contextEntry.startTime} – {contextEntry.endTime}
          </p>
        ) : allSameTimes ? (
          <p className="font-jakarta text-xs tracking-[0.5px] text-text-muted">
            {sortedEntries.map((e) => DAYS_OF_WEEK[e.dayOfWeek]).join(', ')}
            <span className="mx-1 text-white/40">·</span>
            {sortedEntries[0].startTime} – {sortedEntries[0].endTime}
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {sortedEntries.map((e) => (
              <p
                key={e.dayOfWeek}
                className="font-jakarta text-xs tracking-[0.5px] text-text-muted"
              >
                <span className="text-white/80">{DAYS_OF_WEEK[e.dayOfWeek]}</span>{' '}
                {e.startTime} – {e.endTime}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 shrink-0">
        <button
          type="button"
          onClick={handleEdit}
          disabled={disabled}
          aria-label={`Edit ${activity.title}`}
          className={cn(
            'flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[1.1px] text-white/80 transition-colors',
            'hover:bg-white/15',
            'font-jakarta',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Pencil className="h-3 w-3" />
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={disabled}
          aria-label={`Delete ${activity.title}`}
          className={cn(
            'flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[1.1px] text-red-200 transition-colors',
            'hover:bg-red-500/25',
            'font-jakarta',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </button>
      </div>
    </div>
  )
}

export const RecurringActivityCard = memo(RecurringActivityCardImpl)
