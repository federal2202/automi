"use client"

import { Period } from '@/types/period'
import type { StepIndex } from './useOnboardingNavigation'
import { WelcomeStep } from './steps/WelcomeStep'
import { PeriodStep } from './steps/PeriodStep'
import { ActivityStep } from './steps/ActivityStep'

interface WizardStepsProps {
  step: StepIndex
  createdPeriod: Period | null
  setStep: (step: StepIndex) => void
  setCreatedPeriod: (period: Period) => void
  finishAndExit: () => void
}

/**
 * Active step body. Keyed on `step` so each screen re-mounts with the
 * fade-in animation defined in globals.css.
 */
export function WizardSteps({
  step,
  createdPeriod,
  setStep,
  setCreatedPeriod,
  finishAndExit,
}: WizardStepsProps) {
  const handleCreated = (period: Period) => {
    setCreatedPeriod(period)
    setStep(2)
  }

  return (
    <div key={step} className="p-6 sm:p-8 animate-fade-in-up">
      {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}
      {step === 1 && (
        <PeriodStep
          initialPeriod={createdPeriod}
          onBack={() => setStep(0)}
          onCreated={handleCreated}
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
        // Defensive: shouldn't be reachable through the UI (you can't get to
        // step 2 without a period being stashed), but if state is ever out of
        // sync we fall back to step 1 instead of rendering blank.
        <PeriodStep
          initialPeriod={null}
          onBack={() => setStep(0)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}
