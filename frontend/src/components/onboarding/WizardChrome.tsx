"use client"

import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface WizardChromeProps {
  onSkip: () => void
  isCompleting: boolean
  children: ReactNode
}

/**
 * Card shell for the wizard: eyebrow label + global Skip on the left/right of
 * a chrome bar, with the active step body rendered below.
 */
export function WizardChrome({
  onSkip,
  isCompleting,
  children,
}: WizardChromeProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-[#ffffff]/2 backdrop-blur-sm',
        'shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]',
        'overflow-hidden'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-2',
          'border-b border-white/5 bg-white/[0.015]',
          'px-5 sm:px-7 py-3'
        )}
      >
        <span className="text-[10px] uppercase tracking-[1.4px] text-white/40 font-space-grotesk font-bold">
          Lifestyle Setup
        </span>
        <button
          type="button"
          onClick={onSkip}
          disabled={isCompleting}
          aria-label="Skip onboarding"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-2 py-1',
            'text-xs text-white/60 hover:text-white hover:bg-white/5',
            'font-space-grotesk uppercase tracking-wide transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-green-nice/60',
            isCompleting && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span className="hidden sm:inline">Skip</span>
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>

      {children}
    </div>
  )
}
