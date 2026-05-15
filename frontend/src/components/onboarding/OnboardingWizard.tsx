"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/utils/cn'
import { Period } from '@/types/period'
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
 * "Skip for now" on every step routes to `/dashboard/calendar`. The
 * dashboard layout's redirect guard treats the user as onboarded once any
 * Period exists, so skipping mid-wizard after creating a Period in step 2
 * is a legitimate exit path.
 */
export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState<StepIndex>(0)
  const [createdPeriod, setCreatedPeriod] = useState<Period | null>(null)

  const goToDashboard = () => {
    router.replace('/dashboard/calendar')
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <StepIndicator current={step} />

        <div
          className={cn(
            'rounded-2xl border border-white/10 bg-[#ffffff]/2 backdrop-blur-sm',
            'p-6 sm:p-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]'
          )}
        >
          {step === 0 && (
            <WelcomeStep
              onNext={() => setStep(1)}
              onSkip={goToDashboard}
            />
          )}
          {step === 1 && (
            <PeriodStep
              initialPeriod={createdPeriod}
              onBack={() => setStep(0)}
              onCreated={(period) => {
                setCreatedPeriod(period)
                setStep(2)
              }}
              onSkip={goToDashboard}
            />
          )}
          {step === 2 && createdPeriod && (
            <ActivityStep
              periodId={createdPeriod.id}
              periodTitle={createdPeriod.title}
              onBack={() => setStep(1)}
              onFinished={goToDashboard}
              onSkip={goToDashboard}
            />
          )}
          {step === 2 && !createdPeriod && (
            // Defensive: shouldn't be reachable through the UI (you can't get
            // to step 2 without a period being stashed), but if state is ever
            // out of sync we fall back to step 1 instead of rendering blank.
            <PeriodStep
              initialPeriod={null}
              onBack={() => setStep(0)}
              onCreated={(period) => {
                setCreatedPeriod(period)
                setStep(2)
              }}
              onSkip={goToDashboard}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function StepIndicator({ current }: { current: StepIndex }) {
  return (
    <div className="flex items-center justify-center gap-3">
      {STEP_LABELS.map((label, idx) => {
        const isActive = idx === current
        const isComplete = idx < current
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              aria-current={isActive ? 'step' : undefined}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                isActive && 'w-8 bg-green-nice',
                isComplete && 'w-2 bg-green-nice/60',
                !isActive && !isComplete && 'w-2 bg-white/20'
              )}
            />
            <span
              className={cn(
                'font-space-grotesk uppercase tracking-[1.1px] text-[10px]',
                isActive ? 'text-white' : 'text-white/40'
              )}
            >
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
