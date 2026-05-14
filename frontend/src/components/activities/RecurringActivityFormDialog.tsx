"use client"

import { useId, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/cn'
import {
  CreateActivityInput,
  DAYS_OF_WEEK,
  RecurringActivity,
  WEEK_DISPLAY_ORDER,
} from '@/types/activity'

interface RecurringActivityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialActivity?: RecurringActivity | null
  onSubmit: (input: CreateActivityInput) => Promise<void> | void
  isSubmitting?: boolean
  errorMessage?: string | null
}

export function RecurringActivityFormDialog({
  open,
  onOpenChange,
  initialActivity,
  onSubmit,
  isSubmitting,
  errorMessage,
}: RecurringActivityFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-bg-surface border border-white/10 text-white">
        {open && (
          <RecurringActivityFormBody
            key={initialActivity?.id ?? 'create'}
            initialActivity={initialActivity ?? null}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage ?? null}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface RecurringActivityFormBodyProps {
  initialActivity: RecurringActivity | null
  onCancel: () => void
  onSubmit: (input: CreateActivityInput) => Promise<void> | void
  isSubmitting?: boolean
  errorMessage: string | null
}

function RecurringActivityFormBody({
  initialActivity,
  onCancel,
  onSubmit,
  isSubmitting,
  errorMessage,
}: RecurringActivityFormBodyProps) {
  const isEdit = initialActivity !== null
  const errorRegionId = useId()

  const [title, setTitle] = useState(() => initialActivity?.title ?? '')
  // Default to Monday (1) for new activities — matches the Mon-first display
  // order used on the detail page. On edit, pre-select the activity's existing
  // days.
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    () => initialActivity?.daysOfWeek ?? [1]
  )

  const toggleDay = (dow: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(dow) ? prev.filter((d) => d !== dow) : [...prev, dow]
    )
  }
  const [startTime, setStartTime] = useState(
    () => initialActivity?.startTime ?? '09:00'
  )
  const [endTime, setEndTime] = useState(
    () => initialActivity?.endTime ?? '10:00'
  )
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    const trimmed = title.trim()
    if (!trimmed) {
      setValidationError('Title is required.')
      return
    }
    if (!startTime || !endTime) {
      setValidationError('Both start and end times are required.')
      return
    }
    // Both values are `HH:mm` so lexicographic compare matches chronological.
    if (endTime <= startTime) {
      setValidationError('End time must be after start time.')
      return
    }
    if (daysOfWeek.length === 0) {
      setValidationError('Select at least one day.')
      return
    }

    await onSubmit({
      title: trimmed,
      daysOfWeek,
      startTime,
      endTime,
    })
  }

  const errorText = validationError ?? errorMessage ?? null
  const hasError = Boolean(errorText)

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-space-grotesk text-2xl tracking-[-1px] uppercase">
          {isEdit ? 'Edit Activity' : 'Add Activity'}
        </DialogTitle>
        <DialogDescription className="text-text-muted text-[11px] uppercase tracking-[1.1px] font-jakarta">
          Recurring rule // day + time window inside this period
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="activity-title"
            className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
          >
            Title
          </Label>
          <Input
            id="activity-title"
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
            id="activity-days-label"
            className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
          >
            Days of Week
          </span>
          <div
            role="group"
            aria-labelledby="activity-days-label"
            aria-describedby={hasError ? errorRegionId : undefined}
            className="flex flex-wrap gap-2"
          >
            {WEEK_DISPLAY_ORDER.map((dow) => {
              const isActive = daysOfWeek.includes(dow)
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="activity-start"
              className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
            >
              Start Time
            </Label>
            <Input
              id="activity-start"
              type="time"
              value={startTime}
              max={endTime || undefined}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={isSubmitting}
              aria-invalid={hasError || undefined}
              aria-describedby={hasError ? errorRegionId : undefined}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="activity-end"
              className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
            >
              End Time
            </Label>
            <Input
              id="activity-end"
              type="time"
              value={endTime}
              min={startTime || undefined}
              onChange={(e) => setEndTime(e.target.value)}
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

        <DialogFooter className="mt-2 gap-2 sm:gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={cn(
              'rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80',
              'hover:bg-white/10 transition-colors',
              'font-space-grotesk uppercase tracking-wide',
              isSubmitting && 'opacity-50 cursor-not-allowed'
            )}
          >
            Cancel
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
            ) : isEdit ? (
              'Save Changes'
            ) : (
              'Add Activity'
            )}
          </button>
        </DialogFooter>
      </form>
    </>
  )
}
