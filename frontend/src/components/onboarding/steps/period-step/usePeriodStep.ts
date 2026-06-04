"use client"

import { useId, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CreatePeriodInput, Period } from '@/types/period'
import { createPeriod } from '@/services/periods.service'
import { extractAxiosErrorMessage } from '@/utils/api-error'
import { isoToDateInput, dateInputToIso } from '@/utils/date-input'
import { googleCalendarQueryKeys } from '@/hooks/calendar/useGoogleCalendar'

interface UsePeriodStepArgs {
  initialPeriod: Period | null
  onCreated: (period: Period) => void
}

/**
 * State + submission logic for the wizard's period step. Pre-fills from
 * `initialPeriod` (Back navigation), validates inline, and on success creates
 * a brand new period — append-only, no PATCH — invalidating the dashboard's
 * `["periods"]` cache plus the Google Calendar events cache.
 */
export function usePeriodStep({ initialPeriod, onCreated }: UsePeriodStepArgs) {
  const queryClient = useQueryClient()
  const errorRegionId = useId()

  const [title, setTitle] = useState(() => initialPeriod?.title ?? '')
  const [startDate, setStartDate] = useState(() =>
    isoToDateInput(initialPeriod?.startDate)
  )
  const [endDate, setEndDate] = useState(() =>
    isoToDateInput(initialPeriod?.endDate)
  )
  const [validationError, setValidationError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: (input: CreatePeriodInput) => createPeriod(input),
    onSuccess: (period) => {
      void queryClient.invalidateQueries({ queryKey: ['periods'] })
      void queryClient.invalidateQueries({
        queryKey: googleCalendarQueryKeys.events(),
      })
      onCreated(period)
    },
    onError: (err) => {
      const message = extractAxiosErrorMessage(err, 'Failed to create period.')
      setSubmitError(message)
      toast.error(message)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    setSubmitError(null)

    const trimmed = title.trim()
    if (!trimmed) {
      setValidationError('Title is required.')
      return
    }
    if (!startDate || !endDate) {
      setValidationError('Both start and end dates are required.')
      return
    }
    if (endDate < startDate) {
      setValidationError('End date must be on or after start date.')
      return
    }

    await createMutation.mutateAsync({
      title: trimmed,
      startDate: dateInputToIso(startDate),
      endDate: dateInputToIso(endDate),
    })
  }

  const errorText = validationError ?? submitError ?? null

  return {
    errorRegionId,
    title,
    setTitle,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleSubmit,
    isSubmitting: createMutation.isPending,
    errorText,
    hasError: Boolean(errorText),
  }
}
