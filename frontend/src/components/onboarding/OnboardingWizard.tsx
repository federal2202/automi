"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { Period } from '@/types/period'
import { useAuthStore } from '@/stores/authStore'
import { completeOnboarding } from '@/services/onboarding.service'
import { WelcomeStep } from './steps/WelcomeStep'
import { PeriodStep } from './steps/PeriodStep'
import { ActivityStep } from './steps/ActivityStep'

type StepIndex = 0 | 1 | 2

const STEP_LABELS: readonly string[] = ['Welcome', 'Period', 'Activity'] as const

/**
 * Three-step onboarding orchestrator. Holds:
 *  - `step`: which screen is visible (0..2). No URL change between steps —
 *    the wizard lives at a single `/onboarding` route and uses local state
 *    so back/forward feel instant and don't fight Next router transitions.
 *  - `createdPeriod`: stash of the Period returned from step 2, so step 3
 *    knows which `periodId` to POST the new activity under.
 *
 * The global Skip button in the wizard chrome and a successful Finish in
 * step 3 are the only paths that flip the server-side
 * `onboardingCompletedAt` flag. Closing the tab mid-wizard leaves the
 * user in an un-onboarded state and the guard will route them back here
 * on next visit.
 */
export function OnboardingWizard() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const [step, setStep] = useState<StepIndex>(0)
  const [createdPeriod, setCreatedPeriod] = useState<Period | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)

  /**
   * Mark onboarding complete on the server, optimistically update the
   * local auth store so the dashboard guard doesn't bounce the user
   * back here mid-navigation, then route to the calendar. Failure is
   * surfaced via toast but never traps the user.
   *
   * `celebrate` controls whether the calendar plays its first-arrival
   * stagger animation: true only for a real Finish (user completed an
   * activity), false for Skip (no payoff to celebrate).
   */
  const exitToDashboard = async (celebrate: boolean) => {
    if (isCompleting) return
    setIsCompleting(true)
    // Optimistic flip — the guard re-evaluates synchronously off this.
    if (user) {
      setUser({
        ...user,
        onboardingCompletedAt:
          user.onboardingCompletedAt ?? new Date().toISOString(),
      })
    }
    try {
      const updated = await completeOnboarding()
      setUser({ ...(user ?? {}), ...updated })
    } catch (err) {
      console.warn('Failed to mark onboarding complete', err)
      toast.error('Could not save onboarding status. You can revisit later.')
    } finally {
      if (celebrate) {
        try {
          sessionStorage.setItem('justOnboarded', '1')
        } catch {
          // sessionStorage can throw in some privacy modes — animation
          // is a nice-to-have, not critical.
        }
      }
      router.replace('/dashboard/calendar')
    }
  }

  const finishAndExit = () => exitToDashboard(true)
  const skipAndExit = () => exitToDashboard(false)

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <StepIndicator current={step} />

        <div
          className={cn(
            'rounded-2xl border border-white/10 bg-[#ffffff]/2 backdrop-blur-sm',
            'shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]',
            'overflow-hidden'
          )}
        >
          {/* Chrome bar: eyebrow label on left, global Skip on right */}
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
              onClick={skipAndExit}
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

          {/* Step body — keyed so each step re-mounts with the fade-in
              animation defined in globals.css. */}
          <div
            key={step}
            className="p-6 sm:p-8 animate-fade-in-up"
          >
            {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}
            {step === 1 && (
              <PeriodStep
                initialPeriod={createdPeriod}
                onBack={() => setStep(0)}
                onCreated={(period) => {
                  setCreatedPeriod(period)
                  setStep(2)
                }}
              />
            )}
            {step === 2 && createdPeriod && (
              <ActivityStep
                periodId={createdPeriod.id}
                periodTitle={createdPeriod.title}
                onBack={() => setStep(1)}
                onFinished={finishAndExit}
              />
            )}
            {step === 2 && !createdPeriod && (
              // Defensive: shouldn't be reachable through the UI (you can't
              // get to step 2 without a period being stashed), but if state
              // is ever out of sync we fall back to step 1 instead of
              // rendering blank.
              <PeriodStep
                initialPeriod={null}
                onBack={() => setStep(0)}
                onCreated={(period) => {
                  setCreatedPeriod(period)
                  setStep(2)
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Numbered step indicator. Completed steps render a checkmark, the
 * current step is filled with the brand color and pulses subtly,
 * upcoming steps are muted. Circles are connected by a thin progress
 * line whose filled portion tracks the current step.
 */
function StepIndicator({ current }: { current: StepIndex }) {
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
                {isComplete ? (
                  <Check className="h-3 w-3" aria-hidden />
                ) : (
                  idx + 1
                )}
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
