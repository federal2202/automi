"use client"

import { StepHeader } from './StepHeader'
import { StepError } from './StepError'
import { StepActions } from './StepActions'
import { useActivityStep } from './activity-step/useActivityStep'
import { ActivityTitleField } from './activity-step/ActivityTitleField'
import { ActivityDayPicker } from './activity-step/ActivityDayPicker'
import { ActivityTimeFields } from './activity-step/ActivityTimeFields'

interface ActivityStepProps {
  periodId: string
  periodTitle: string
  onBack: () => void
  onFinished: () => void
}

/** Step 3: collect one recurring activity scoped to the period from step 2. */
export function ActivityStep({
  periodId,
  periodTitle,
  onBack,
  onFinished,
}: ActivityStepProps) {
  const step = useActivityStep({ periodId, onFinished })

  return (
    <div className="flex flex-col gap-6">
      <StepHeader
        title="Add a recurring activity"
        subtitle={<>Inside &ldquo;{periodTitle}&rdquo; // weekday + time window</>}
      />

      <form onSubmit={step.handleSubmit} className="flex flex-col gap-4">
        <ActivityTitleField
          errorRegionId={step.errorRegionId}
          hasError={step.hasError}
          isSubmitting={step.isSubmitting}
          title={step.title}
          setTitle={step.setTitle}
        />

        <ActivityDayPicker
          errorRegionId={step.errorRegionId}
          hasError={step.hasError}
          isSubmitting={step.isSubmitting}
          schedule={step.schedule}
          toggleDay={step.toggleDay}
        />

        <ActivityTimeFields
          errorRegionId={step.errorRegionId}
          hasError={step.hasError}
          isSubmitting={step.isSubmitting}
          schedule={step.schedule}
          sortedEntries={step.sortedEntries}
          sameTimeForAll={step.sameTimeForAll}
          sharedStart={step.sharedStart}
          sharedEnd={step.sharedEnd}
          handleSameTimeToggle={step.handleSameTimeToggle}
          updateSharedStart={step.updateSharedStart}
          updateSharedEnd={step.updateSharedEnd}
          updateEntryStart={step.updateEntryStart}
          updateEntryEnd={step.updateEntryEnd}
        />

        <StepError id={step.errorRegionId} errorText={step.errorText} />

        <StepActions
          onBack={onBack}
          isSubmitting={step.isSubmitting}
          submitLabel="Finish"
        />
      </form>
    </div>
  )
}
