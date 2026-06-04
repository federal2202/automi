"use client"

import { useParams } from 'next/navigation'
import { RecurringActivityFormDialog } from '@/components/activities/RecurringActivityFormDialog'
import { ConfirmDeleteDialog } from '@/components/periods/ConfirmDeleteDialog'
import { usePeriodDetail } from '@/hooks/periods'
import { PeriodDetailHeader } from './_components/PeriodDetailHeader'
import { ActivitiesSection } from './_components/ActivitiesSection'

/**
 * Detail page for a single Period. Lists Recurring Activities grouped by day
 * of week (Mon → Sun). A thin container that wires `usePeriodDetail` to the
 * header, activities section and dialogs.
 */
export default function PeriodDetailPage() {
  const params = useParams<{ id: string }>()
  const periodId = params?.id ?? ''

  const {
    periodQuery,
    activitiesQuery,
    grouped,
    isFormOpen,
    editingActivity,
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
  } = usePeriodDetail(periodId)

  const { data: period } = periodQuery
  const { data: activities } = activitiesQuery
  const hasActivities = Boolean(activities && activities.length > 0)

  return (
    <div className="bg-bg-surface text-white min-h-full w-full flex flex-col p-2 sm:p-4 md:p-6 lg:p-8">
      <PeriodDetailHeader
        period={period}
        isLoading={periodQuery.isLoading}
        isError={periodQuery.isError}
        error={periodQuery.error}
        isFetching={periodQuery.isFetching}
        onRetry={() => periodQuery.refetch()}
        onAddActivity={openCreate}
      />

      <ActivitiesSection
        grouped={grouped}
        hasActivities={hasActivities}
        isLoading={activitiesQuery.isLoading}
        isError={activitiesQuery.isError}
        error={activitiesQuery.error}
        isFetching={activitiesQuery.isFetching}
        actionError={actionError}
        onRetry={() => activitiesQuery.refetch()}
        onEdit={openEdit}
        onDelete={requestDelete}
        deletingId={deletingId}
      />

      <RecurringActivityFormDialog
        open={isFormOpen}
        onOpenChange={closeForm}
        initialActivity={editingActivity}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        errorMessage={formError}
      />

      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        onOpenChange={closeDelete}
        title="Delete activity"
        description="This permanently removes the recurring rule from this period and any Google Calendar events generated for it."
        itemLabel={pendingDelete?.title ?? ''}
        isPending={isDeletePending}
        pendingLabel="Syncing to Google Calendar..."
        onConfirm={confirmDelete}
      />
    </div>
  )
}
