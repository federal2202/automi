"use client"

import { useCallback, useState } from 'react'
import { Plus } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPeriod,
  deletePeriod,
  getPeriods,
  updatePeriod,
} from '@/services/periods.service'
import { CreatePeriodInput, Period } from '@/types/period'
import { PeriodCard } from '@/components/periods/PeriodCard'
import { PeriodFormDialog } from '@/components/periods/PeriodFormDialog'
import { ConfirmDeleteDialog } from '@/components/periods/ConfirmDeleteDialog'
import { extractAxiosErrorMessage } from '@/utils/api-error'
import { cn } from '@/utils/cn'
import { googleCalendarQueryKeys } from '@/hooks/calendar/useGoogleCalendar'

const PERIODS_QUERY_KEY = ['periods'] as const

export default function PeriodsPage() {
  const queryClient = useQueryClient()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Period | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const {
    data: periods,
    isLoading,
    isError,
    error: queryError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: PERIODS_QUERY_KEY,
    queryFn: getPeriods,
    // Prevent immediate refetch on tab/window focus thrash. 30s is short enough
    // that the list stays fresh while we navigate inside the dashboard.
    staleTime: 30_000,
  })

  // Server is the source of truth — every successful mutation invalidates so
  // server-derived fields (updatedAt, etc.) stay in sync. No more hybrid
  // setQueryData + stale cache.
  const invalidatePeriods = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: PERIODS_QUERY_KEY })
  }, [queryClient])

  const createMutation = useMutation({
    mutationFn: (input: CreatePeriodInput) => createPeriod(input),
    onSuccess: () => {
      void invalidatePeriods()
      void queryClient.invalidateQueries({ queryKey: googleCalendarQueryKeys.events() })
      setIsFormOpen(false)
      setEditingPeriod(null)
      setFormError(null)
    },
    onError: (err) => {
      setFormError(extractAxiosErrorMessage(err, 'Failed to create period.'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: CreatePeriodInput
    }) => updatePeriod(id, input),
    onSuccess: () => {
      void invalidatePeriods()
      void queryClient.invalidateQueries({ queryKey: googleCalendarQueryKeys.events() })
      setIsFormOpen(false)
      setEditingPeriod(null)
      setFormError(null)
    },
    onError: (err) => {
      setFormError(extractAxiosErrorMessage(err, 'Failed to update period.'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePeriod(id),
    onMutate: () => {
      setActionError(null)
    },
    onSuccess: () => {
      void invalidatePeriods()
      void queryClient.invalidateQueries({ queryKey: googleCalendarQueryKeys.events() })
      setPendingDelete(null)
    },
    onError: (err) => {
      setActionError(extractAxiosErrorMessage(err, 'Failed to delete period.'))
    },
  })

  const openCreate = useCallback(() => {
    setEditingPeriod(null)
    setFormError(null)
    setIsFormOpen(true)
  }, [])

  const openEdit = useCallback((period: Period) => {
    setEditingPeriod(period)
    setFormError(null)
    setIsFormOpen(true)
  }, [])

  const handleSubmit = useCallback(
    async (input: CreatePeriodInput) => {
      setFormError(null)
      if (editingPeriod) {
        await updateMutation.mutateAsync({ id: editingPeriod.id, input })
      } else {
        await createMutation.mutateAsync(input)
      }
    },
    [editingPeriod, updateMutation, createMutation]
  )

  const requestDelete = useCallback((period: Period) => {
    setActionError(null)
    setPendingDelete(period)
  }, [])

  const confirmDelete = useCallback(() => {
    if (!pendingDelete) return
    deleteMutation.mutate(pendingDelete.id)
  }, [pendingDelete, deleteMutation])

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const deletingId = deleteMutation.isPending ? pendingDelete?.id ?? null : null

  return (
    <div className="bg-bg-surface text-white min-h-full w-full flex flex-col p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl lg:text-[48px] font-bold text-text-primary tracking-[-2.4px] uppercase leading-tight font-space-grotesk">
              PERIODS
            </h1>
            <p className="text-[10px] md:text-[11px] text-text-muted tracking-[1.1px] uppercase font-jakarta">
              LIFE PHASES // BOUNDARIES FOR RECURRING ACTIVITIES
            </p>
          </div>

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
            Create Period
          </button>
        </div>
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {actionError}
        </div>
      )}

      {isLoading && (
        <p className="text-white/70">Loading periods...</p>
      )}

      {isError && (
        <div className="flex flex-col items-start gap-3">
          <p className="text-red-400">
            Failed to load periods.{' '}
            {extractAxiosErrorMessage(queryError, 'Please try again.')}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className={cn(
              'rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80',
              'hover:bg-white/10 transition-colors',
              'font-space-grotesk uppercase tracking-wide',
              isFetching && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isFetching ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      )}

      {!isLoading && !isError && periods && periods.length === 0 && (
        <div className="flex flex-col items-start gap-3">
          <p className="text-white/70">
            No periods yet. Create your first life phase to start scheduling
            recurring activities inside it.
          </p>
        </div>
      )}

      {!isLoading && !isError && periods && periods.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {periods.map((period) => (
            <PeriodCard
              key={period.id}
              period={period}
              onEdit={openEdit}
              onDelete={requestDelete}
              disabled={deletingId === period.id}
            />
          ))}
        </div>
      )}

      <PeriodFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) {
            setEditingPeriod(null)
            setFormError(null)
          }
        }}
        initialPeriod={editingPeriod}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        errorMessage={formError}
      />

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        itemLabel={pendingDelete?.title ?? ''}
        description="This will also remove all Google Calendar events created for this period's activities. Continue?"
        isPending={deleteMutation.isPending}
        pendingLabel="Syncing to Google Calendar..."
        onConfirm={confirmDelete}
      />
    </div>
  )
}
