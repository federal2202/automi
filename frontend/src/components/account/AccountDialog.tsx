"use client"

import { useState } from 'react'
import { LogOut } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppSelector } from '@/stores/hooks'
import { useLogout } from '@/hooks/auth/useLogout'
import { UserAvatar } from './UserAvatar'
import { LogoutConfirmDialog } from './LogoutConfirmDialog'

interface AccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Profile modal: avatar, name, email + a button that opens logout confirm. */
export function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
  const user = useAppSelector((s) => s.auth.user)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { logout, isPending } = useLogout()

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-bg-surface border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="font-space-grotesk text-2xl tracking-[-1px] uppercase">
              Account
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar user={user} className="h-12 w-12 text-base" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate font-jakarta">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-white/60 truncate font-jakarta">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-500/15 px-4 py-2 text-sm font-bold text-red-200 hover:bg-red-500/25 transition-colors font-space-grotesk uppercase tracking-wide"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </DialogContent>
      </Dialog>

      <LogoutConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        isPending={isPending}
        onConfirm={logout}
      />
    </>
  )
}
