"use client"

import {
  DAYS_OF_WEEK_LONG,
  RecurringActivity,
  WEEK_DISPLAY_ORDER,
} from '@/types/activity'
import { RecurringActivityCard } from '@/components/activities/RecurringActivityCard'
import type { ActivityDayBuckets } from '@/hooks/periods'

interface ActivitiesByDayProps {
  grouped: ActivityDayBuckets
  onEdit: (activity: RecurringActivity) => void
  onDelete: (activity: RecurringActivity) => void
  deletingId: string | null
}

/**
 * Renders recurring activities grouped by weekday in `WEEK_DISPLAY_ORDER`
 * (Mon → Sun). Days with no activities are skipped.
 */
export function ActivitiesByDay({
  grouped,
  onEdit,
  onDelete,
  deletingId,
}: ActivitiesByDayProps) {
  return (
    <div className="flex flex-col gap-6">
      {WEEK_DISPLAY_ORDER.map((dow) => {
        const bucket = grouped[dow]
        if (!bucket || bucket.length === 0) return null
        return (
          <section key={dow} className="flex flex-col gap-2">
            <h3 className="font-jakarta text-[11px] uppercase tracking-[1.1px] text-text-muted">
              {DAYS_OF_WEEK_LONG[dow]}
            </h3>
            <div className="flex flex-col gap-2">
              {bucket.map((activity) => (
                <RecurringActivityCard
                  key={activity.id}
                  activity={activity}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  disabled={deletingId === activity.id}
                  dayContext={dow}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
