"use client"

import { useState } from 'react'
import { cn } from '@/utils/cn'
import { useAppSelector } from '@/stores/hooks'
import { UserAvatar } from './UserAvatar'
import { AccountDialog } from './AccountDialog'

/**
 * Clickable user block for the sidebar footer. Opens the {@link AccountDialog}.
 * Collapsed state ("icon" sidebar) shows only the avatar, still clickable.
 */
export function SidebarUserButton() {
  const user = useAppSelector((s) => s.auth.user)
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
  const [open, setOpen] = useState(false)

  if (!isAuthenticated) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open account menu"
        className={cn(
          'flex items-center gap-3 min-w-0 w-full rounded-lg p-1 -m-1 text-left',
          'hover:bg-sidebar-accent transition-colors',
          'group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center',
          'group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:m-0'
        )}
      >
        <UserAvatar user={user} className="h-9 w-9 text-sm" />
        <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
          <p className="text-sm font-medium text-sidebar-foreground truncate">
            {user?.name || 'User'}
          </p>
          <p className="text-xs text-sidebar-foreground/60 truncate">
            {user?.email || 'user@example.com'}
          </p>
        </div>
      </button>

      <AccountDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
