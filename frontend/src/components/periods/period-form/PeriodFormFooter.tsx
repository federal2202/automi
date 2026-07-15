"use client"

import { DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/utils/cn'

interface PeriodFormFooterProps {
  isEdit: boolean
  isSubmitting?: boolean
  onCancel: () => void
}

/** Cancel + submit buttons for the period form, with edit-aware busy labels. */
export function PeriodFormFooter({
  isEdit,
  isSubmitting,
  onCancel,
}: PeriodFormFooterProps) {
  return (
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
          'rounded-lg border border-green-nice/40 bg-green-nice/15 px-4 py-2 text-sm font-bold text-green-200',
          'hover:bg-green-nice/25 transition-colors',
          'font-space-grotesk uppercase tracking-wide',
          isSubmitting && 'opacity-60 cursor-not-allowed'
        )}
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-3.5 w-3.5 rounded-full border-2 border-green-200/40 border-t-green-200 animate-spin"
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
  )
}
