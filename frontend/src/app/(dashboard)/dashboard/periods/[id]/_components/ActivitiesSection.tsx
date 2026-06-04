"use client"

import { RecurringActivity } from '@/types/activity'
import { QueryErrorRetry } from '@/components/periods/QueryErrorRetry'
import type { ActivityDayBuckets } from '@/hooks/periods'
import { ActivitiesByDay } from './ActivitiesByDay'

interface ActivitiesSectionProps {
  grouped: ActivityDayBuckets
  hasActivities: boolean
  isLoading: boolean
  isError: boolean
  error: unknown
  isFetching: boolean
  actionError: string | null
  onRetry: () => void
  onEdit: (activity: RecurringActivity) => void
  onDelete: (activity: RecurringActivity) => void
  deletingId: string | null
}

/** Recurring activities section: heading, error/loading/empty states + list. */
export function ActivitiesSection({
  grouped,
  hasActivities,
  isLoading,
  isError,
  error,
  isFetching,
  actionError,
  onRetry,
  onEdit,
  onDelete,
  deletingId,
}: ActivitiesSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-3">
        <h2 className="font-space-grotesk text-xl uppercase tracking-[-0.5px] text-text-primary">
          Recurring activities
        </h2>
        <span className="text-[10px] uppercase tracking-[1.1px] text-text-muted font-jakarta">
          Mon → Sun
        </span>
      </div>

      {actionError && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {actionError}
        </div>
      )}

      {isLoading && (
        <p className="text-white/70 font-jakarta">Loading activities…</p>
      )}

      {isError && (
        <QueryErrorRetry
          message="Failed to load activities."
          error={error}
          isFetching={isFetching}
          onRetry={onRetry}
          retryingLabel="Retrying…"
        />
      )}

      {!isLoading && !isError && !hasActivities && (
        <p className="text-white/70 font-jakarta">
          No activities yet. Add a recurring rule to start scheduling inside
          this period.
        </p>
      )}

      {!isLoading && !isError && hasActivities && (
        <ActivitiesByDay
          grouped={grouped}
          onEdit={onEdit}
          onDelete={onDelete}
          deletingId={deletingId}
        />
      )}
    </div>
  )
}
