'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'
import { ChevronDown, User, Mail, Calendar, Settings, LogOut } from 'lucide-react'
import LogoutButton from './LogoutButton'

interface UserProfileProps {
  className?: string
  variant?: 'dropdown' | 'inline' | 'minimal'
  showDetails?: boolean
  onSettingsClick?: () => void
}

export default function UserProfile({
  className,
  variant = 'dropdown',
  showDetails = true,
  onSettingsClick
}: UserProfileProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  if (!isAuthenticated || !user) {
    return null
  }

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2 animate-pulse', className)}>
        <div className="w-8 h-8 bg-muted rounded-full" />
        <div className="hidden sm:block">
          <div className="w-24 h-4 bg-muted rounded mb-1" />
          <div className="w-20 h-3 bg-muted rounded" />
        </div>
      </div>
    )
  }

  const UserAvatar = () => (
    <div className="w-8 h-8 bg-green-nice/10 rounded-full flex items-center justify-center border-2 border-green-nice/20">
      {user.picture ? (
        <img
          src={user.picture}
          alt={user.name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <User className="w-4 h-4 text-green-nice" />
      )}
    </div>
  )

  const UserInfo = ({ compact = false }) => (
    <div className={cn('text-left', { 'hidden sm:block': compact })}>
      <div className="text-sm font-medium text-foreground truncate max-w-[120px]">
        {user.name}
      </div>
      {showDetails && (
        <div className="text-xs text-muted-foreground truncate max-w-[120px]">
          {user.email}
        </div>
      )}
    </div>
  )

  // Minimal variant - just avatar
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center', className)}>
        <UserAvatar />
      </div>
    )
  }

  // Inline variant - avatar and info side by side
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <UserAvatar />
        <UserInfo />
      </div>
    )
  }

  // Dropdown variant - interactive profile menu
  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#ffffff]/5 transition-colors w-full"
      >
        <UserAvatar />
        <UserInfo compact />
        <ChevronDown
          className={cn(
            'w-4 h-4 text-muted-foreground transition-transform ml-auto',
            isDropdownOpen && 'rotate-180'
          )}
        />
      </button>

      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg z-50 animate-fade-in-down">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <UserAvatar />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </div>
                  {user.verified !== undefined && (
                    <div className={cn(
                      'text-xs mt-1',
                      user.verified ? 'text-green-nice' : 'text-yellow-500'
                    )}>
                      {user.verified ? '✓ Verified' : '⚠ Unverified'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-2">
              {user.createdAt && (
                <div className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </div>
              )}
              
              {onSettingsClick && (
                <button
                  onClick={() => {
                    onSettingsClick()
                    setIsDropdownOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-[#ffffff]/5 rounded-md transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              )}

              <div className="border-t border-border mt-2 pt-2">
                <LogoutButton
                  variant="ghost"
                  size="small"
                  className="w-full justify-start text-left hover:bg-destructive/10 hover:text-destructive"
                  showConfirmation
                  onSuccess={() => setIsDropdownOpen(false)}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </LogoutButton>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}