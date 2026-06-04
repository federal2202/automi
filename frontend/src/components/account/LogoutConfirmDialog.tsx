"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfirmDeleteFooter } from '@/components/periods/ConfirmDeleteFooter'

interface LogoutConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending?: boolean
  onConfirm: () => void
}

/**
 * Confirmation step before signing out. Reuses {@link ConfirmDeleteFooter}
 * for the Cancel + destructive-confirm pair, and blocks dismissal while the
 * sign-out request is in flight.
 */
export function LogoutConfirmDialog({
  open,
  onOpenChange,
  isPending,
  onConfirm,
}: LogoutConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isPending && !next) return
        onOpenChange(next)
      }}
    >
      <DialogContent className="bg-bg-surface border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="font-space-grotesk text-2xl tracking-[-1px] uppercase">
            Log out
          </DialogTitle>
          <DialogDescription className="text-text-muted text-[11px] uppercase tracking-[1.1px] font-jakarta">
            End your session
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm text-white/80 font-jakarta">
          Are you sure you want to log out?
        </p>

        <ConfirmDeleteFooter
          confirmLabel="Log out"
          pendingLabel="Logging out..."
          isPending={isPending}
          onCancel={() => onOpenChange(false)}
          onConfirm={onConfirm}
        />
      </DialogContent>
    </Dialog>
  )
}
