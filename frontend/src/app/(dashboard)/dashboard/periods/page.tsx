"use client"

import dynamic from 'next/dynamic'
import { usePeriods } from '@/hooks/periods'
import { PeriodsHeader } from './_components/PeriodsHeader'
import { PeriodsEmptyState, PeriodsGrid } from './_components/PeriodsGrid'
import { QueryErrorRetry } from '@/components/periods/QueryErrorRetry'

const PeriodFormDialog = dynamic(
  () => import('@/components/periods/PeriodFormDialog').then((m) => ({ default: m.PeriodFormDialog })),
  { ssr: false }
)
const ConfirmDeleteDialog = dynamic(
  () => import('@/components/periods/ConfirmDeleteDialog').then((m) => ({ default: m.ConfirmDeleteDialog })),
  { ssr: false }
)

export default function PeriodsPage() {
  const {
    listQuery,
    isFormOpen,
    editingPeriod,
    formError,
    pendingDelete,
    actionError,
    isSubmitting,
    deletingId,
    isDeletePending,
    openCreate,
    openEdit,
    handleSubmit,
    requestDelete,
    confirmDelete,
    closeForm,
    closeDelete,
  } = usePeriods()

  const { data: periods, isLoading, isError, error, refetch, isFetching } =
    listQuery

  return (
    <div className="bg-bg-surface text-white min-h-full w-full min-w-0 overflow-x-hidden flex flex-col p-4 sm:p-4 md:p-6 lg:p-8">
      <PeriodsHeader onCreate={openCreate} />

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {actionError}
        </div>
      )}

      {isLoading && <p className="text-white/70">Loading periods...</p>}

      {isError && (
        <QueryErrorRetry
          message="Failed to load periods."
          error={error}
          isFetching={isFetching}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && periods && periods.length === 0 && (
        <PeriodsEmptyState />
      )}

      {!isLoading && !isError && periods && periods.length > 0 && (
        <PeriodsGrid
          periods={periods}
          onEdit={openEdit}
          onDelete={requestDelete}
          deletingId={deletingId}
        />
      )}

      <PeriodFormDialog
        open={isFormOpen}
        onOpenChange={closeForm}
        initialPeriod={editingPeriod}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        errorMessage={formError}
      />

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        onOpenChange={closeDelete}
        itemLabel={pendingDelete?.title ?? ''}
        description="This will also remove all Google Calendar events created for this period's activities. Continue?"
        isPending={isDeletePending}
        pendingLabel="Syncing to Google Calendar..."
        onConfirm={confirmDelete}
      />
    </div>
  )
}
