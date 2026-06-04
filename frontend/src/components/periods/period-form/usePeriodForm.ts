"use client"

import { useId, useState } from 'react'
import { CreatePeriodInput, Period } from '@/types/period'
import {
  isoToDateInput,
  toPeriodInput,
  validatePeriodForm,
} from './period-form.utils'

interface UsePeriodFormArgs {
  initialPeriod: Period | null
  onSubmit: (input: CreatePeriodInput) => Promise<void> | void
  errorMessage: string | null
}

/**
 * Local state + validation for the period form body. The body is remounted
 * (via `key`) whenever the dialog opens with a different period, so state is
 * seeded lazily from props — no setState-in-effect needed.
 */
export function usePeriodForm({
  initialPeriod,
  onSubmit,
  errorMessage,
}: UsePeriodFormArgs) {
  const isEdit = initialPeriod !== null
  const errorRegionId = useId()

  const [title, setTitle] = useState(() => initialPeriod?.title ?? '')
  const [startDate, setStartDate] = useState(() =>
    isoToDateInput(initialPeriod?.startDate)
  )
  const [endDate, setEndDate] = useState(() =>
    isoToDateInput(initialPeriod?.endDate)
  )
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    const trimmed = title.trim()
    const error = validatePeriodForm(trimmed, startDate, endDate)
    if (error) {
      setValidationError(error)
      return
    }

    await onSubmit(toPeriodInput(trimmed, startDate, endDate))
  }

  const errorText = validationError ?? errorMessage ?? null

  return {
    isEdit,
    errorRegionId,
    title,
    setTitle,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleSubmit,
    errorText,
    hasError: Boolean(errorText),
  }
}
