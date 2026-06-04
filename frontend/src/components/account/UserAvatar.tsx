"use client"

import { useState } from 'react'
import { cn } from '@/utils/cn'
import type { User } from '@/types/User'

interface UserAvatarProps {
  user: Pick<User, 'name' | 'picture'> | null
  className?: string
}

/** Circular avatar: user picture when available, otherwise the name initial. */
export function UserAvatar({ user, className }: UserAvatarProps) {
  // Google avatar URLs (lh3.googleusercontent.com) 403 when the browser sends
  // a Referer, so they silently fail to load. If that happens we drop back to
  // the name initial instead of showing a broken-image icon.
  const [failed, setFailed] = useState(false)

  const base = cn(
    'flex items-center justify-center rounded-full shrink-0 overflow-hidden',
    'bg-green-nice/20 text-green-nice font-bold',
    className
  )

  if (user?.picture && !failed) {
    return (
      <span className={base}>
        {/* Plain <img>: Google avatar URLs aren't whitelisted for next/image. */}
        {/* `no-referrer` stops Google from 403-ing the hotlinked avatar. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.picture}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      </span>
    )
  }

  return (
    <span className={base}>
      <span>{user?.name?.charAt(0) || 'U'}</span>
    </span>
  )
}
