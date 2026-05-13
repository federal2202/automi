"use client"

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Plus } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getPeriodById } from '@/services/periods.service'
import {
  createActivity,
  deleteActivity,
  getActivities,
  updateActivity,
} from '@/services/activities.service'
import {
  CreateActivityInput,
  DAYS_OF_WEEK_LONG,
  RecurringActivity,
  WEEK_DISPLAY_ORDER,
} from '@/types/activity'
import { RecurringActivityCard } from '@/components/activities/RecurringActivityCard'
import { RecurringActivityFormDialog } from '@/components/activities/RecurringActivityFormDialog'
import { ConfirmDeleteDialog } from '@/components/periods/ConfirmDeleteDialog'
import { extractAxiosErrorMessage } from '@/utils/api-error'
import { formatPeriodRange } from '@/utils/period-dates'
import { cn } from '@/utils/cn'

/**
 * Detail page for a single Period. Lists Recurring Activities grouped by day
 * of week (Mon → Sun, see `WEEK_DISPLAY_ORDER`). Activities are sorted by
 * `startTime` ascending within each day.
 */
export default function PeriodDetailPage() {
  const params = useParams<{ id: string }>()
  const periodId = params?.id ?? ''
  const queryClient = useQueryClient()

  const periodQueryKey = useMemo(() => ['period', periodId] as const, [periodId])
  const activitiesQueryKey = useMemo(
    () => ['period', periodId, 'activities'] as const,
    [periodId]
  )

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingActivity, setEditingActivity] =
    useState<RecurringActivity | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] =
    useState<RecurringActivity | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const {
    data: period,
    isLoading: isPeriodLoading,
    isError: isPeriodError,
    error: periodError,
    refetch: refetchPeriod,
    isFetching: isPeriodFetching,
  } = useQuery({
    queryKey: periodQueryKey,
    queryFn: () => getPeriodById(periodId),
    enabled: Boolean(periodId),
    staleTime: 30_000,
  })

  const {
    data: activities,
    isLoading: isActivitiesLoading,
    isError: isActivitiesError,
    error: activitiesError,
    refetch: refetchActivities,
    isFetching: isActivitiesFetching,
  } = useQuery({
    queryKey: activitiesQueryKey,
    queryFn: () => getActivities(periodId),
    enabled: Boolean(periodId),
    staleTime: 30_000,
  })

  const invalidateActivities = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: activitiesQueryKey })
  }, [queryClient, activitiesQueryKey])

  const createMutation = useMutation({
    mutationFn: (input: CreateActivityInput) =>
      createActivity(periodId, input),
    onSuccess: () => {
      void invalidateActivities()
      setIsFormOpen(false)
      setEditingActivity(null)
      setFormError(null)
    },
    onError: (err) => {
      setFormError(extractAxiosErrorMessage(err, 'Failed to create activity.'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateActivityInput }) =>
      updateActivity(periodId, id, input),
    onSuccess: () => {
      void invalidateActivities()
      setIsFormOpen(false)
      setEditingActivity(null)
      setFormError(null)
    },
    onError: (err) => {
      setFormError(extractAxiosErrorMessage(err, 'Failed to update activity.'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteActivity(periodId, id),
    onMutate: () => {
      setActionError(null)
    },
    onSuccess: () => {
      void invalidateActivities()
      setPendingDelete(null)
    },
    onError: (err) => {
      setActionError(
        extractAxiosErrorMessage(err, 'Failed to delete activity.')
      )
    },
  })

  const openCreate = useCallback(() => {
    setEditingActivity(null)
    setFormError(null)
    setIsFormOpen(true)
  }, [])

  const openEdit = useCallback((activity: RecurringActivity) => {
    setEditingActivity(activity)
    setFormError(null)
    setIsFormOpen(true)
  }, [])

  const handleSubmit = useCallback(
    async (input: CreateActivityInput) => {
      setFormError(null)
      if (editingActivity) {
        await updateMutation.mutateAsync({ id: editingActivity.id, input })
      } else {
        await createMutation.mutateAsync(input)
      }
    },
    [editingActivity, updateMutation, createMutation]
  )

  const requestDelete = useCallback((activity: RecurringActivity) => {
    setActionError(null)
    setPendingDelete(activity)
  }, [])

  const confirmDelete = useCallback(() => {
    if (!pendingDelete) return
    deleteMutation.mutate(pendingDelete.id)
  }, [pendingDelete, deleteMutation])

  /**
   * Bucket activities by `dayOfWeek` (0..6) and sort each bucket by start time.
   * Times are zero-padded `HH:mm`, so lexicographic compare matches chronological.
   */
  const grouped = useMemo(() => {
    const buckets: Record<number, RecurringActivity[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    }
    if (!activities) return buckets
    for (const a of activities) {
      if (a.dayOfWeek >= 0 && a.dayOfWeek <= 6) {
        buckets[a.dayOfWeek].push(a)
      }
    }
    for (const dow of Object.keys(buckets)) {
      buckets[Number(dow)].sort((x, y) => x.startTime.localeCompare(y.startTime))
    }
    return buckets
  }, [activities])

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const deletingId = deleteMutation.isPending ? pendingDelete?.id ?? null : null
  const hasActivities = activities && activities.length > 0

  return (
    <div className="bg-bg-surface text-white min-h-full w-full flex flex-col p-2 sm:p-4 md:p-6 lg:p-8">
      <Link
        href="/dashboard/periods"
        className={cn(
          'inline-flex items-center gap-1.5 self-start mb-4 rounded-md px-2 py-1 text-[11px] uppercase tracking-[1.1px] text-text-muted',
          'font-jakarta hover:text-white hover:bg-white/5 transition-colors'
        )}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to periods
      </Link>

      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex flex-col min-w-0">
            {isPeriodLoading && (
              <p className="text-white/70 font-jakarta">Loading period…</p>
            )}
            {isPeriodError && (
              <div className="flex flex-col items-start gap-3">
                <p className="text-red-400">
                  Failed to load period.{' '}
                  {extractAxiosErrorMessage(periodError, 'Please try again.')}
                </p>
                <button
                  type="button"
                  onClick={() => refetchPeriod()}
                  disabled={isPeriodFetching}
                  className={cn(
                    'rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80',
                    'hover:bg-white/10 transition-colors',
                    'font-space-grotesk uppercase tracking-wide',
                    isPeriodFetching && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {isPeriodFetching ? 'Retrying…' : 'Retry'}
                </button>
              </div>
            )}
            {period && (
              <>
                <h1 className="text-2xl md:text-3xl lg:text-[48px] font-bold text-text-primary tracking-[-2.4px] uppercase leading-tight font-space-grotesk line-clamp-2">
                  {period.title}
                </h1>
                <p className="text-[10px] md:text-[11px] text-text-muted tracking-[1.1px] uppercase font-jakarta">
                  {formatPeriodRange(period.startDate, period.endDate)}
                </p>
              </>
            )}
          </div>

          {period && (
            <button
              type="button"
              onClick={openCreate}
              className={cn(
                'inline-flex items-center justify-center gap-2 self-start lg:self-auto',
                'rounded-lg bg-green-nice px-4 py-2.5 text-sm font-bold text-white',
                'hover:bg-green-nice/90 active:scale-[0.98] transition-all',
                'font-space-grotesk uppercase tracking-wide'
              )}
            >
              <Plus className="h-4 w-4" />
              Add Activity
            </button>
          )}
        </div>
      </div>

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

        {isActivitiesLoading && (
          <p className="text-white/70 font-jakarta">Loading activities…</p>
        )}

        {isActivitiesError && (
          <div className="flex flex-col items-start gap-3">
            <p className="text-red-400">
              Failed to load activities.{' '}
              {extractAxiosErrorMessage(activitiesError, 'Please try again.')}
            </p>
            <button
              type="button"
              onClick={() => refetchActivities()}
              disabled={isActivitiesFetching}
              className={cn(
                'rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80',
                'hover:bg-white/10 transition-colors',
                'font-space-grotesk uppercase tracking-wide',
                isActivitiesFetching && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isActivitiesFetching ? 'Retrying…' : 'Retry'}
            </button>
          </div>
        )}

        {!isActivitiesLoading && !isActivitiesError && !hasActivities && (
          <p className="text-white/70 font-jakarta">
            No activities yet. Add a recurring rule to start scheduling inside
            this period.
          </p>
        )}

        {!isActivitiesLoading && !isActivitiesError && hasActivities && (
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
                        onEdit={openEdit}
                        onDelete={requestDelete}
                        disabled={deletingId === activity.id}
                      />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>

      <RecurringActivityFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) {
            setEditingActivity(null)
            setFormError(null)
          }
        }}
        initialActivity={editingActivity}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        errorMessage={formError}
      />

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        title="Delete activity"
        description="This permanently removes the recurring rule from this period."
        itemLabel={pendingDelete?.title ?? ''}
        isPending={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
