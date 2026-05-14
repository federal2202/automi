"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/utils/cn'

interface ConfirmDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Displayed as the bolded subject of the confirmation prompt. */
  itemLabel: string
  /** Optional override of the heading. Defaults to "Delete period". */
  title?: string
  /** Optional override of the destructive button label. */
  confirmLabel?: string
  /** Optional override of the body text after the bolded item label. */
  description?: string
  /**
   * Label shown on the destructive button while the mutation is in flight.
   * Override when the operation fans out to Google Calendar and may take
   * several seconds (so the user understands the wait).
   */
  pendingLabel?: string
  isPending?: boolean
  onConfirm: () => void
}

/**
 * Lightweight destructive-action confirm dialog built on top of the existing
 * Radix Dialog primitives — we don't ship `@radix-ui/react-alert-dialog`, so
 * shadcn's `<AlertDialog>` isn't available. Keeps the same UX shape:
 *   - destructive emphasis on the confirm button
 *   - explicit cancel path
 *   - blocks dismissal while the mutation is in flight
 */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  itemLabel,
  title = 'Delete period',
  confirmLabel = 'Delete',
  description = 'This permanently removes the period and any recurring activities attached to it.',
  pendingLabel = 'Deleting...',
  isPending,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Don't allow closing while the destructive mutation is running —
        // matches AlertDialog's modal-by-default behavior.
        if (isPending && !next) return
        onOpenChange(next)
      }}
    >
      <DialogContent className="bg-bg-surface border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="font-space-grotesk text-2xl tracking-[-1px] uppercase">
            {title}
          </DialogTitle>
          <DialogDescription className="text-text-muted text-[11px] uppercase tracking-[1.1px] font-jakarta">
            This cannot be undone
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm text-white/80 font-jakarta">
          Delete <span className="font-semibold text-white">&ldquo;{itemLabel}&rdquo;</span>?
          {' '}
          {description}
        </p>

        <DialogFooter className="mt-2 gap-2 sm:gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
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
      </DialogContent>
    </Dialog>
  )
}
