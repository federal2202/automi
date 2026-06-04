"use client"

import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { StepIndex } from './useOnboardingNavigation'

const STEP_LABELS: readonly string[] = ['Welcome', 'Period', 'Activity'] as const

/**
 * Numbered step indicator. Completed steps render a checkmark, the current
 * step is filled with the brand color and pulses subtly, upcoming steps are
 * muted. Circles are connected by a thin progress line whose filled portion
 * tracks the current step.
 */
export function StepIndicator({ current }: { current: StepIndex }) {
  return (
    <ol
      role="list"
      aria-label="Onboarding progress"
      className="flex items-center justify-center gap-2 sm:gap-3"
    >
      {STEP_LABELS.map((label, idx) => {
        const isActive = idx === current
        const isComplete = idx < current
        const isLast = idx === STEP_LABELS.length - 1
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span
                aria-current={isActive ? 'step' : undefined}
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full',
                  'text-[10px] font-bold font-space-grotesk',
                  'transition-all duration-300',
                  isComplete && 'bg-green-nice/80 text-white',
                  isActive &&
                    'bg-green-nice text-white ring-4 ring-green-nice/20 scale-110',
                  !isActive &&
                    !isComplete &&
                    'bg-white/5 text-white/40 border border-white/10'
                )}
              >
                {isComplete ? <Check className="h-3 w-3" aria-hidden /> : idx + 1}
              </span>
              <span
                className={cn(
                  'font-space-grotesk uppercase tracking-[1.1px] text-[10px]',
                  'transition-colors duration-300',
                  isActive
                    ? 'text-white'
                    : isComplete
                      ? 'text-white/60'
                      : 'text-white/30'
                )}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  'h-px w-6 sm:w-10 rounded-full transition-colors duration-300',
                  isComplete ? 'bg-green-nice/60' : 'bg-white/10'
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
