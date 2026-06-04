"use client"

import { useId, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CreateActivityInput } from '@/types/activity'
import { createActivity } from '@/services/activities.service'
import { extractAxiosErrorMessage } from '@/utils/api-error'
import { toastActivityCreate } from '@/utils/activity-sync-toast'
import { googleCalendarQueryKeys } from '@/hooks/calendar/useGoogleCalendar'
import { validateActivityForm } from './activity-step.utils'
import { useScheduleEditor } from './useScheduleEditor'

interface UseActivityStepArgs {
  periodId: string
  onFinished: () => void
}

/**
 * State + submission logic for the wizard's activity step. Composes
 * `useScheduleEditor` (weekday chips -> `schedule[]` + "same time" toggle) and
 * owns the title, validation, and create mutation. Create-only path; on
 * success invalidates the dashboard's `["period", id, "activities"]` key plus
 * the Google Calendar events cache.
 */
export function useActivityStep({ periodId, onFinished }: UseActivityStepArgs) {
  const queryClient = useQueryClient()
  const errorRegionId = useId()
  const editor = useScheduleEditor()

  const [title, setTitle] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: (input: CreateActivityInput) => createActivity(periodId, input),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({
        queryKey: ['period', periodId, 'activities'],
      })
      void queryClient.invalidateQueries({
        queryKey: googleCalendarQueryKeys.events(),
      })
      toastActivityCreate(response.sync)
      onFinished()
    },
    onError: (err) => {
      const message = extractAxiosErrorMessage(err, 'Failed to add activity.')
      setSubmitError(message)
      toast.error(message)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    setSubmitError(null)

    const trimmed = title.trim()
    const error = validateActivityForm(trimmed, editor.schedule)
    if (error) {
      setValidationError(error)
      return
    }

    await createMutation.mutateAsync({ title: trimmed, schedule: editor.schedule })
  }

  const errorText = validationError ?? submitError ?? null

  return {
    ...editor,
    errorRegionId,
    title,
    setTitle,
    handleSubmit,
    isSubmitting: createMutation.isPending,
    errorText,
    hasError: Boolean(errorText),
  }
}
