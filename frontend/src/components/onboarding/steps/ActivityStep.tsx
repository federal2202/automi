"use client"

import { useId, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/cn'
import {
  CreateActivityInput,
  DAYS_OF_WEEK,
  DAYS_OF_WEEK_LONG,
  ScheduleEntry,
  WEEK_DISPLAY_ORDER,
} from '@/types/activity'
import { createActivity } from '@/services/activities.service'
import { extractAxiosErrorMessage } from '@/utils/api-error'
import { googleCalendarQueryKeys } from '@/hooks/calendar/useGoogleCalendar'
import { toastActivityCreate } from '@/utils/activity-sync-toast'
import { toast } from 'sonner'

interface ActivityStepProps {
  periodId: string
  periodTitle: string
  onBack: () => void
  onFinished: () => void
  onSkip: () => void
}

const DEFAULT_START = '09:00'
const DEFAULT_END = '10:00'

/**
 * Step 3: collect one recurring activity scoped to the period from step 2.
 *
 * Mirrors `RecurringActivityFormDialog`: weekday chips drive `schedule[]`
 * (each entry is `{ dayOfWeek, startTime, endTime }`), with a "same time
 * for all" convenience toggle. We keep the create-only path here — the
 * full edit affordance lives on `/dashboard/periods/[id]`. On submit we
 * invalidate `["period", id, "activities"]` (the exact key used by the
 * dashboard detail page) plus the Google Calendar events cache.
 */
export function ActivityStep({
  periodId,
  periodTitle,
  onBack,
  onFinished,
  onSkip,
}: ActivityStepProps) {
  const queryClient = useQueryClient()
  const errorRegionId = useId()

  const [title, setTitle] = useState('')
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([
    { dayOfWeek: 1, startTime: DEFAULT_START, endTime: DEFAULT_END },
  ])
  const [sameTimeForAll, setSameTimeForAll] = useState(true)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const sortedEntries = useMemo(() => {
    const orderIndex = new Map<number, number>()
    WEEK_DISPLAY_ORDER.forEach((dow, idx) => orderIndex.set(dow, idx))
    return [...schedule].sort(
      (a, b) =>
        (orderIndex.get(a.dayOfWeek) ?? 0) - (orderIndex.get(b.dayOfWeek) ?? 0)
    )
  }, [schedule])

  const sharedStart = schedule[0]?.startTime ?? DEFAULT_START
  const sharedEnd = schedule[0]?.endTime ?? DEFAULT_END

  const createMutation = useMutation({
    mutationFn: (input: CreateActivityInput) =>
      createActivity(periodId, input),
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

  const toggleDay = (dow: number) => {
    setSchedule((prev) => {
      const exists = prev.some((e) => e.dayOfWeek === dow)
      if (exists) {
        return prev.filter((e) => e.dayOfWeek !== dow)
      }
      const start = prev[0]?.startTime ?? DEFAULT_START
      const end = prev[0]?.endTime ?? DEFAULT_END
      return [...prev, { dayOfWeek: dow, startTime: start, endTime: end }]
    })
  }

  const updateSharedStart = (value: string) => {
    setSchedule((prev) => prev.map((e) => ({ ...e, startTime: value })))
  }
  const updateSharedEnd = (value: string) => {
    setSchedule((prev) => prev.map((e) => ({ ...e, endTime: value })))
  }
  const updateEntryStart = (dow: number, value: string) => {
    setSchedule((prev) =>
      prev.map((e) => (e.dayOfWeek === dow ? { ...e, startTime: value } : e))
    )
  }
  const updateEntryEnd = (dow: number, value: string) => {
    setSchedule((prev) =>
      prev.map((e) => (e.dayOfWeek === dow ? { ...e, endTime: value } : e))
    )
  }

  const handleSameTimeToggle = (next: boolean) => {
    if (next && !sameTimeForAll) {
      setSchedule((prev) => {
        if (prev.length === 0) return prev
        const s = prev[0].startTime
        const e = prev[0].endTime
        return prev.map((entry) => ({ ...entry, startTime: s, endTime: e }))
      })
    }
    setSameTimeForAll(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    setSubmitError(null)

    const trimmed = title.trim()
    if (!trimmed) {
      setValidationError('Title is required.')
      return
    }
    if (schedule.length === 0) {
      setValidationError('Select at least one day.')
      return
    }
    for (const entry of schedule) {
      if (!entry.startTime || !entry.endTime) {
        setValidationError('Both start and end times are required.')
        return
      }
      if (entry.endTime <= entry.startTime) {
        setValidationError(
          `End time must be after start time on ${DAYS_OF_WEEK_LONG[entry.dayOfWeek]}.`
        )
        return
      }
    }

    await createMutation.mutateAsync({ title: trimmed, schedule })
  }

  const isSubmitting = createMutation.isPending
  const errorText = validationError ?? submitError ?? null
  const hasError = Boolean(errorText)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-space-grotesk text-3xl sm:text-4xl tracking-[-1.5px] uppercase leading-tight">
          Add a recurring activity
        </h1>
        <p className="text-[11px] uppercase tracking-[1.1px] text-text-muted font-jakarta">
          Inside &ldquo;{periodTitle}&rdquo; // weekday + time window
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="onboarding-activity-title"
            className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
          >
            Title
          </Label>
          <Input
            id="onboarding-activity-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Morning gym"
            autoFocus
            disabled={isSubmitting}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorRegionId : undefined}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span
            id="onboarding-activity-days-label"
            className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
          >
            Days of Week
          </span>
          <div
            role="group"
            aria-labelledby="onboarding-activity-days-label"
            aria-describedby={hasError ? errorRegionId : undefined}
            className="flex flex-wrap gap-2"
          >
            {WEEK_DISPLAY_ORDER.map((dow) => {
              const isActive = schedule.some((e) => e.dayOfWeek === dow)
              return (
                <button
                  key={dow}
                  type="button"
                  onClick={() => toggleDay(dow)}
                  disabled={isSubmitting}
                  aria-pressed={isActive}
                  className={cn(
                    'min-w-[44px] rounded-full border px-3 py-1.5 text-xs font-bold',
                    'font-space-grotesk uppercase tracking-wide transition-colors',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-green-nice/60',
                    isActive
                      ? 'bg-green-nice border-green-nice text-white'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white',
                    isSubmitting && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {DAYS_OF_WEEK[dow]}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label
            className={cn(
              'flex items-center gap-2 text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta select-none',
              isSubmitting && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input
              type="checkbox"
              checked={sameTimeForAll}
              onChange={(e) => handleSameTimeToggle(e.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4 rounded border-white/20 bg-white/5 accent-green-nice"
            />
            Same time for all selected days
          </label>

          {sameTimeForAll ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="onboarding-activity-start"
                  className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
                >
                  Start Time
                </Label>
                <Input
                  id="onboarding-activity-start"
                  type="time"
                  value={sharedStart}
                  max={sharedEnd || undefined}
                  onChange={(e) => updateSharedStart(e.target.value)}
                  disabled={isSubmitting || schedule.length === 0}
                  aria-invalid={hasError || undefined}
                  aria-describedby={hasError ? errorRegionId : undefined}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="onboarding-activity-end"
                  className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
                >
                  End Time
                </Label>
                <Input
                  id="onboarding-activity-end"
                  type="time"
                  value={sharedEnd}
                  min={sharedStart || undefined}
                  onChange={(e) => updateSharedEnd(e.target.value)}
                  disabled={isSubmitting || schedule.length === 0}
                  aria-invalid={hasError || undefined}
                  aria-describedby={hasError ? errorRegionId : undefined}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {sortedEntries.length === 0 && (
                <p className="text-white/50 text-xs font-jakarta">
                  Select at least one day above to configure times.
                </p>
              )}
              {sortedEntries.map((entry) => {
                const startId = `onboarding-activity-start-${entry.dayOfWeek}`
                const endId = `onboarding-activity-end-${entry.dayOfWeek}`
                return (
                  <div
                    key={entry.dayOfWeek}
                    className="grid grid-cols-[80px_1fr_1fr] items-center gap-3"
                  >
                    <span className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta">
                      {DAYS_OF_WEEK_LONG[entry.dayOfWeek]}
                    </span>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor={startId} className="sr-only">
                        Start time for {DAYS_OF_WEEK_LONG[entry.dayOfWeek]}
                      </Label>
                      <Input
                        id={startId}
                        type="time"
                        value={entry.startTime}
                        max={entry.endTime || undefined}
                        onChange={(e) =>
                          updateEntryStart(entry.dayOfWeek, e.target.value)
                        }
                        disabled={isSubmitting}
                        aria-invalid={hasError || undefined}
                        aria-describedby={hasError ? errorRegionId : undefined}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor={endId} className="sr-only">
                        End time for {DAYS_OF_WEEK_LONG[entry.dayOfWeek]}
                      </Label>
                      <Input
                        id={endId}
                        type="time"
                        value={entry.endTime}
                        min={entry.startTime || undefined}
                        onChange={(e) =>
                          updateEntryEnd(entry.dayOfWeek, e.target.value)
                        }
                        disabled={isSubmitting}
                        aria-invalid={hasError || undefined}
                        aria-describedby={hasError ? errorRegionId : undefined}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onSkip}
            disabled={isSubmitting}
            className={cn(
              'text-sm text-white/50 hover:text-white/80 transition-colors',
              'font-jakarta underline-offset-4 hover:underline self-center sm:self-auto',
              isSubmitting && 'opacity-50 cursor-not-allowed'
            )}
          >
            Skip for now
          </button>
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className={cn(
                'rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80',
                'hover:bg-white/10 transition-colors',
                'font-space-grotesk uppercase tracking-wide',
                isSubmitting && 'opacity-50 cursor-not-allowed'
              )}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'rounded-lg bg-green-nice px-4 py-2 text-sm font-bold text-white',
                'hover:bg-green-nice/90 transition-colors',
                'font-space-grotesk uppercase tracking-wide',
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
                'Finish'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
