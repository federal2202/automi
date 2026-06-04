"use client"

import { cn } from '@/utils/cn'

interface StepActionsProps {
  onBack: () => void
  isSubmitting: boolean
  /** Label shown on the primary submit button when idle (e.g. "Next", "Finish"). */
  submitLabel: string
}

/**
 * Shared Back / submit button row used by the data-collecting wizard steps.
 * While submitting, the primary button shows the Google Calendar sync spinner.
 * Markup and styling are identical across PeriodStep and ActivityStep — the
 * only variation is the idle submit label.
 */
export function StepActions({
  onBack,
  isSubmitting,
  submitLabel,
}: StepActionsProps) {
  return (
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
          submitLabel
        )}
      </button>
    </div>
  )
}
