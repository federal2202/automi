"use client"

import { useOnboardingNavigation } from './useOnboardingNavigation'
import { StepIndicator } from './StepIndicator'
import { WizardChrome } from './WizardChrome'
import { WizardSteps } from './WizardSteps'

/**
 * Three-step onboarding orchestrator. Composes the progress indicator, the
 * card chrome (eyebrow + global Skip), and the active step body. All state
 * and completion wiring (including the optimistic Redux `setUser` flip) lives
 * in `useOnboardingNavigation`.
 */
export function OnboardingWizard() {
  const {
    step,
    setStep,
    createdPeriod,
    setCreatedPeriod,
    isCompleting,
    finishAndExit,
    skipAndExit,
  } = useOnboardingNavigation()

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <StepIndicator current={step} />

        <WizardChrome onSkip={skipAndExit} isCompleting={isCompleting}>
          <WizardSteps
            step={step}
            createdPeriod={createdPeriod}
            setStep={setStep}
            setCreatedPeriod={setCreatedPeriod}
            finishAndExit={finishAndExit}
          />
        </WizardChrome>
      </div>
    </div>
  )
}
