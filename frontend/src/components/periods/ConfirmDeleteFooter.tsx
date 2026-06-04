"use client"

import { DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/utils/cn'

interface ConfirmDeleteFooterProps {
  confirmLabel: string
  pendingLabel: string
  isPending?: boolean
  onCancel: () => void
  onConfirm: () => void
}

/** Cancel + destructive-confirm buttons for {@link ConfirmDeleteDialog}. */
export function ConfirmDeleteFooter({
  confirmLabel,
  pendingLabel,
  isPending,
  onCancel,
  onConfirm,
}: ConfirmDeleteFooterProps) {
  return (
    <DialogFooter className="mt-2 gap-2 sm:gap-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={isPending}
        className={cn(
          'rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80',
          'hover:bg-white/10 transition-colors',
          'font-space-grotesk uppercase tracking-wide',
          isPending && 'opacity-50 cursor-not-allowed'
        )}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isPending}
        className={cn(
          'rounded-lg border border-red-500/40 bg-red-500/15 px-4 py-2 text-sm font-bold text-red-200',
          'hover:bg-red-500/25 transition-colors',
          'font-space-grotesk uppercase tracking-wide',
          isPending && 'opacity-60 cursor-not-allowed'
        )}
      >
        {isPending ? (
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-3.5 w-3.5 rounded-full border-2 border-red-200/40 border-t-red-200 animate-spin"
            />
            {pendingLabel}
          </span>
        ) : (
          confirmLabel
        )}
      </button>
    </DialogFooter>
  )
}
