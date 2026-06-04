"use client"

import { useCallback, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getPeriodById } from '@/services/periods.service'
import {
  createActivity,
  deleteActivity,
  getActivities,
  updateActivity,
} from '@/services/activities.service'
import { CreateActivityInput, RecurringActivity } from '@/types/activity'
import { extractAxiosErrorMessage } from '@/utils/api-error'
import { googleCalendarQueryKeys } from '@/hooks/calendar/useGoogleCalendar'
import {
  toastActivityCreate,
  toastActivityDelete,
  toastActivityUpdate,
} from '@/utils/activity-sync-toast'
import { groupActivitiesByDay } from './usePeriodDetail.utils'
import { useCrudDialogs } from './useCrudDialogs'

/**
 * Orchestrates the Period detail page: the period + activities queries, the
 * create/update/delete activity mutations (each invalidating activities + the
 * Google Calendar events cache and firing the matching sync toast), and the
 * form/delete dialog state. Returns activities grouped by weekday for display.
 */
export function usePeriodDetail(periodId: string) {
  const queryClient = useQueryClient()
  const dialogs = useCrudDialogs<RecurringActivity>()
  const {
    editing: editingActivity,
    pendingDelete,
    setIsFormOpen,
    setEditing,
    setFormError,
    setPendingDelete,
    setActionError,
  } = dialogs

  const periodQueryKey = useMemo(() => ['period', periodId] as const, [periodId])
  const activitiesQueryKey = useMemo(
    () => ['period', periodId, 'activities'] as const,
    [periodId]
  )

  const periodQuery = useQuery({
    queryKey: periodQueryKey,
    queryFn: () => getPeriodById(periodId),
    enabled: Boolean(periodId),
    staleTime: 30_000,
  })

  const activitiesQuery = useQuery({
    queryKey: activitiesQueryKey,
    queryFn: () => getActivities(periodId),
    enabled: Boolean(periodId),
    staleTime: 30_000,
  })

  const onWriteSuccess = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: activitiesQueryKey })
    void queryClient.invalidateQueries({ queryKey: googleCalendarQueryKeys.events() })
    setIsFormOpen(false)
    setEditing(null)
    setFormError(null)
  }, [queryClient, activitiesQueryKey, setIsFormOpen, setEditing, setFormError])

  const createMutation = useMutation({
    mutationFn: (input: CreateActivityInput) => createActivity(periodId, input),
    onSuccess: (response) => {
      onWriteSuccess()
      toastActivityCreate(response.sync)
    },
    onError: (err) =>
      setFormError(extractAxiosErrorMessage(err, 'Failed to create activity.')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateActivityInput }) =>
      updateActivity(periodId, id, input),
    onSuccess: (response) => {
      onWriteSuccess()
      toastActivityUpdate(response.sync)
    },
    onError: (err) =>
      setFormError(extractAxiosErrorMessage(err, 'Failed to update activity.')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteActivity(periodId, id),
    onMutate: () => setActionError(null),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: activitiesQueryKey })
      void queryClient.invalidateQueries({ queryKey: googleCalendarQueryKeys.events() })
      setPendingDelete(null)
      toastActivityDelete(result)
    },
    onError: (err) =>
      setActionError(extractAxiosErrorMessage(err, 'Failed to delete activity.')),
  })

  const handleSubmit = useCallback(
    async (input: CreateActivityInput) => {
      setFormError(null)
      if (editingActivity) {
        await updateMutation.mutateAsync({ id: editingActivity.id, input })
      } else {
        await createMutation.mutateAsync(input)
      }
    },
    [editingActivity, updateMutation, createMutation, setFormError]
  )

  const confirmDelete = useCallback(() => {
    if (!pendingDelete) return
    deleteMutation.mutate(pendingDelete.id)
  }, [pendingDelete, deleteMutation])

  const grouped = useMemo(
    () => groupActivitiesByDay(activitiesQuery.data),
    [activitiesQuery.data]
  )

  return {
    periodQuery,
    activitiesQuery,
    grouped,
    isFormOpen: dialogs.isFormOpen,
    editingActivity,
    formError: dialogs.formError,
    pendingDelete,
    actionError: dialogs.actionError,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    deletingId: deleteMutation.isPending ? pendingDelete?.id ?? null : null,
    isDeletePending: deleteMutation.isPending,
    openCreate: dialogs.openCreate,
    openEdit: dialogs.openEdit,
    handleSubmit,
    requestDelete: dialogs.requestDelete,
    confirmDelete,
    closeForm: dialogs.closeForm,
    closeDelete: dialogs.closeDelete,
  }
}
