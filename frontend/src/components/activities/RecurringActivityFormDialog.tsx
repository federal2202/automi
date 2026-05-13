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
  DAYS_OF_WEEK_LONG,
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
  // order used on the detail page.
  const [dayOfWeek, setDayOfWeek] = useState<number>(
    () => initialActivity?.dayOfWeek ?? 1
  )
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
    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      setValidationError('Day of week is invalid.')
      return
    }

    await onSubmit({
      title: trimmed,
      dayOfWeek,
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
          <Label
            htmlFor="activity-day"
            className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
          >
            Day of Week
          </Label>
          <select
            id="activity-day"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
            disabled={isSubmitting}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorRegionId : undefined}
            className={cn(
              'h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white',
              'font-jakarta',
              'focus:outline-none focus:ring-2 focus:ring-green-nice/50',
              isSubmitting && 'opacity-50 cursor-not-allowed'
            )}
          >
            {WEEK_DISPLAY_ORDER.map((dow) => (
              <option key={dow} value={dow} className="bg-bg-surface text-white">
                {DAYS_OF_WEEK_LONG[dow]}
              </option>
            ))}
          </select>
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
            {isSubmitting
              ? isEdit
                ? 'Saving...'
                : 'Adding...'
              : isEdit
                ? 'Save Changes'
                : 'Add Activity'}
          </button>
        </DialogFooter>
      </form>
    </>
  )
}
