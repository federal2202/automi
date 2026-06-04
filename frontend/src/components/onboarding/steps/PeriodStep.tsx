"use client"

import { Period } from '@/types/period'
import { StepHeader } from './StepHeader'
import { StepError } from './StepError'
import { StepActions } from './StepActions'
import { usePeriodStep } from './period-step/usePeriodStep'
import { PeriodFields } from './period-step/PeriodFields'

interface PeriodStepProps {
  /** When the user navigates Back from step 3 and returns here, the form is
   *  pre-filled with the previously created period so they can confirm or
   *  edit before continuing. Submitting again creates a brand new period —
   *  we don't attempt PATCH here to keep the wizard append-only. */
  initialPeriod: Period | null
  onBack: () => void
  onCreated: (period: Period) => void
}

/** Step 2: create the first period (title + date range) the activity hangs off. */
export function PeriodStep({
  initialPeriod,
  onBack,
  onCreated,
}: PeriodStepProps) {
  const step = usePeriodStep({ initialPeriod, onCreated })

  return (
    <div className="flex flex-col gap-6">
      <StepHeader
        title="Create your first period"
        subtitle="Life phase boundary // title and date range"
      />

      <form onSubmit={step.handleSubmit} className="flex flex-col gap-4">
        <PeriodFields
          errorRegionId={step.errorRegionId}
          hasError={step.hasError}
          isSubmitting={step.isSubmitting}
          title={step.title}
          setTitle={step.setTitle}
          startDate={step.startDate}
          setStartDate={step.setStartDate}
          endDate={step.endDate}
          setEndDate={step.setEndDate}
        />

        <StepError id={step.errorRegionId} errorText={step.errorText} />

        <StepActions
          onBack={onBack}
          isSubmitting={step.isSubmitting}
          submitLabel="Next"
        />
      </form>
    </div>
  )
}
