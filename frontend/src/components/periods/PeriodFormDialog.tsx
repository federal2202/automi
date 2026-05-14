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
import { CreatePeriodInput, Period } from '@/types/period'

interface PeriodFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialPeriod?: Period | null
  onSubmit: (input: CreatePeriodInput) => Promise<void> | void
  isSubmitting?: boolean
  errorMessage?: string | null
}

/**
 * Extract the calendar date (YYYY-MM-DD) directly from the ISO string.
 *
 * IMPORTANT: We never run the value through `new Date(...)` here. A "date-only"
 * period boundary like "2026-05-13T00:00:00.000Z" parsed in a non-UTC zone
 * shifts backward/forward by hours, which previously caused the date input
 * to display the wrong day on DST boundaries. Slicing the first 10 chars
 * of the canonical ISO string is timezone-free.
 */
function isoToDateInput(value?: string): string {
  if (!value) return ''
  // Defensive: anything we accept here should already be ISO-8601, but if a
  // caller passes a non-string or short string, fall back to empty.
  if (typeof value !== 'string' || value.length < 10) return ''
  return value.slice(0, 10)
}

/**
 * Convert a `<input type="date">` value back to a canonical ISO string that
 * round-trips losslessly with `isoToDateInput`. Stays at midnight UTC so the
 * date component is preserved regardless of the viewer's timezone.
 */
function dateInputToIso(value: string): string {
  return `${value}T00:00:00.000Z`
}

export function PeriodFormDialog({
  open,
  onOpenChange,
  initialPeriod,
  onSubmit,
  isSubmitting,
  errorMessage,
}: PeriodFormDialogProps) {
  // The form body is remounted (via `key`) whenever the dialog opens with a
  // different period, so its local state can be seeded lazily from props and
  // we don't need an effect that calls setState (which lint forbids).
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-bg-surface border border-white/10 text-white">
        {open && (
          <PeriodFormBody
            key={initialPeriod?.id ?? 'create'}
            initialPeriod={initialPeriod ?? null}
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

interface PeriodFormBodyProps {
  initialPeriod: Period | null
  onCancel: () => void
  onSubmit: (input: CreatePeriodInput) => Promise<void> | void
  isSubmitting?: boolean
  errorMessage: string | null
}

function PeriodFormBody({
  initialPeriod,
  onCancel,
  onSubmit,
  isSubmitting,
  errorMessage,
}: PeriodFormBodyProps) {
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
    if (!trimmed) {
      setValidationError('Title is required.')
      return
    }
    if (!startDate || !endDate) {
      setValidationError('Both start and end dates are required.')
      return
    }
    // Pure lexicographic compare — both values are YYYY-MM-DD here.
    if (endDate < startDate) {
      setValidationError('End date must be on or after start date.')
      return
    }

    await onSubmit({
      title: trimmed,
      startDate: dateInputToIso(startDate),
      endDate: dateInputToIso(endDate),
    })
  }

  const errorText = validationError ?? errorMessage ?? null
  const hasError = Boolean(errorText)

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-space-grotesk text-2xl tracking-[-1px] uppercase">
          {isEdit ? 'Edit Period' : 'Create Period'}
        </DialogTitle>
        <DialogDescription className="text-text-muted text-[11px] uppercase tracking-[1.1px] font-jakarta">
          Life phase boundary // title and date range
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="period-title"
              className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
            >
              Title
            </Label>
            <Input
              id="period-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sabbatical 2026"
              autoFocus
              disabled={isSubmitting}
              aria-invalid={hasError || undefined}
              aria-describedby={hasError ? errorRegionId : undefined}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>

          {isEdit && (
            <p className="text-[11px] text-text-muted tracking-[0.4px] font-jakarta -mb-2">
              Changing dates will sync Google Calendar events accordingly.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="period-start"
                className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
              >
                Start Date
              </Label>
              <Input
                id="period-start"
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
                htmlFor="period-end"
                className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
              >
                End Date
              </Label>
              <Input
                id="period-end"
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
                  {isEdit ? 'Syncing to Google Calendar...' : 'Creating...'}
                </span>
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Create Period'
              )}
            </button>
        </DialogFooter>
      </form>
    </>
  )
}
