"use client"

import { useId, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/cn'
import { CreatePeriodInput, Period } from '@/types/period'
import { createPeriod } from '@/services/periods.service'
import { extractAxiosErrorMessage } from '@/utils/api-error'
import { googleCalendarQueryKeys } from '@/hooks/calendar/useGoogleCalendar'

interface PeriodStepProps {
  /** When the user navigates Back from step 3 and returns here, the form is
   *  pre-filled with the previously created period so they can confirm or
   *  edit before continuing. Submitting again creates a brand new period —
   *  we don't attempt PATCH here to keep the wizard append-only. */
  initialPeriod: Period | null
  onBack: () => void
  onCreated: (period: Period) => void
}

/**
 * Inline date <-> ISO helpers, copied verbatim from PeriodFormDialog so the
 * wizard's persistence semantics match the dashboard: dates round-trip as
 * `YYYY-MM-DDT00:00:00.000Z` and never run through `new Date()` to avoid
 * DST-related day shifts.
 */
function isoToDateInput(value?: string): string {
  if (!value) return ''
  if (typeof value !== 'string' || value.length < 10) return ''
  return value.slice(0, 10)
}
function dateInputToIso(value: string): string {
  return `${value}T00:00:00.000Z`
}

export function PeriodStep({
  initialPeriod,
  onBack,
  onCreated,
}: PeriodStepProps) {
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

  const isSubmitting = createMutation.isPending
  const errorText = validationError ?? submitError ?? null
  const hasError = Boolean(errorText)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-space-grotesk text-3xl sm:text-4xl tracking-[-1.5px] uppercase leading-tight">
          Create your first period
        </h1>
        <p className="text-[11px] uppercase tracking-[1.1px] text-text-muted font-jakarta">
          Life phase boundary // title and date range
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="onboarding-period-title"
            className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
          >
            Title
          </Label>
          <Input
            id="onboarding-period-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Fall Semester"
            autoFocus
            disabled={isSubmitting}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorRegionId : undefined}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="onboarding-period-start"
              className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
            >
              Start Date
            </Label>
            <Input
              id="onboarding-period-start"
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isSubmitting}
              aria-invalid={hasError || undefined}
              aria-describedby={hasError ? errorRegionId : undefined}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="onboarding-period-end"
              className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
            >
              End Date
            </Label>
            <Input
              id="onboarding-period-end"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isSubmitting}
              aria-invalid={hasError || undefined}
              aria-describedby={hasError ? errorRegionId : undefined}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>

        <p
          id={errorRegionId}
          role="alert"
          aria-live="polite"
          className={cn(
            'text-sm text-red-400 min-h-[1.25rem]',
            !hasError && 'sr-only'
          )}
        >
          {errorText ?? ''}
        </p>

        <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className={cn(
                'h-10 rounded-lg border border-white/15 bg-white/5 px-4 text-sm font-medium text-white/80',
                'hover:bg-white/10 transition-colors',
                'font-space-grotesk uppercase tracking-wide',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-green-nice/60',
                isSubmitting && 'opacity-50 cursor-not-allowed'
              )}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'h-10 rounded-lg bg-green-nice px-4 text-sm font-bold text-white',
                'hover:bg-green-nice/90 transition-colors',
                'font-space-grotesk uppercase tracking-wide',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-green-nice/60',
                isSubmitting && 'opacity-60 cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <span
                    aria-hidden
                    className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin"
                  />
                  Syncing to Google Calendar...
                </span>
              ) : (
                'Next'
              )}
            </button>
        </div>
      </form>
    </div>
  )
}
