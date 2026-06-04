"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfirmDeleteFooter } from './ConfirmDeleteFooter'

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

        <ConfirmDeleteFooter
          confirmLabel={confirmLabel}
          pendingLabel={pendingLabel}
          isPending={isPending}
          onCancel={() => onOpenChange(false)}
          onConfirm={onConfirm}
        />
      </DialogContent>
    </Dialog>
  )
}
