"use client"

import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPeriod,
  deletePeriod,
  getPeriods,
  updatePeriod,
} from '@/services/periods.service'
import { CreatePeriodInput, Period } from '@/types/period'
import { extractAxiosErrorMessage } from '@/utils/api-error'
import { googleCalendarQueryKeys } from '@/hooks/calendar/useGoogleCalendar'
import { useCrudDialogs } from './useCrudDialogs'

export const PERIODS_QUERY_KEY = ['periods'] as const

/**
 * Orchestrates the Periods list: list query, create/update/delete mutations,
 * and the form/delete dialog state. Server is the source of truth — every
 * successful mutation invalidates the list (so server-derived fields stay in
 * sync) plus the Google Calendar events cache.
 */
export function usePeriods() {
  const queryClient = useQueryClient()
  const dialogs = useCrudDialogs<Period>()
  const {
    editing: editingPeriod,
    pendingDelete,
    setIsFormOpen,
    setEditing,
    setFormError,
    setPendingDelete,
    setActionError,
  } = dialogs

  const listQuery = useQuery({
    queryKey: PERIODS_QUERY_KEY,
    queryFn: getPeriods,
    // 30s keeps the list fresh during dashboard navigation without thrashing
    // on tab/window focus.
    staleTime: 30_000,
  })

  const invalidatePeriods = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: PERIODS_QUERY_KEY })
  }, [queryClient])

  const onWriteSuccess = useCallback(() => {
    void invalidatePeriods()
    void queryClient.invalidateQueries({ queryKey: googleCalendarQueryKeys.events() })
    setIsFormOpen(false)
    setEditing(null)
    setFormError(null)
  }, [invalidatePeriods, queryClient, setIsFormOpen, setEditing, setFormError])

  const createMutation = useMutation({
    mutationFn: (input: CreatePeriodInput) => createPeriod(input),
    onSuccess: onWriteSuccess,
    onError: (err) =>
      setFormError(extractAxiosErrorMessage(err, 'Failed to create period.')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreatePeriodInput }) =>
      updatePeriod(id, input),
    onSuccess: onWriteSuccess,
    onError: (err) =>
      setFormError(extractAxiosErrorMessage(err, 'Failed to update period.')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePeriod(id),
    onMutate: () => setActionError(null),
    onSuccess: () => {
      void invalidatePeriods()
      void queryClient.invalidateQueries({ queryKey: googleCalendarQueryKeys.events() })
      setPendingDelete(null)
    },
    onError: (err) =>
      setActionError(extractAxiosErrorMessage(err, 'Failed to delete period.')),
  })

  const handleSubmit = useCallback(
    async (input: CreatePeriodInput) => {
      setFormError(null)
      if (editingPeriod) {
        await updateMutation.mutateAsync({ id: editingPeriod.id, input })
      } else {
        await createMutation.mutateAsync(input)
      }
    },
    [editingPeriod, updateMutation, createMutation, setFormError]
  )

  const confirmDelete = useCallback(() => {
    if (!pendingDelete) return
    deleteMutation.mutate(pendingDelete.id)
  }, [pendingDelete, deleteMutation])

  return {
    listQuery,
    isFormOpen: dialogs.isFormOpen,
    editingPeriod,
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
