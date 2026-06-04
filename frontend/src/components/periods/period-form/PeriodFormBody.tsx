"use client"

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/utils/cn'
import { CreatePeriodInput, Period } from '@/types/period'
import { usePeriodForm } from './usePeriodForm'
import { PeriodFormFields } from './PeriodFormFields'
import { PeriodFormFooter } from './PeriodFormFooter'

interface PeriodFormBodyProps {
  initialPeriod: Period | null
  onCancel: () => void
  onSubmit: (input: CreatePeriodInput) => Promise<void> | void
  isSubmitting?: boolean
  errorMessage: string | null
}

export function PeriodFormBody({
  initialPeriod,
  onCancel,
  onSubmit,
  isSubmitting,
  errorMessage,
}: PeriodFormBodyProps) {
  const {
    isEdit,
    errorRegionId,
    title,
    setTitle,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleSubmit,
    errorText,
    hasError,
  } = usePeriodForm({ initialPeriod, onSubmit, errorMessage })

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-space-grotesk text-2xl tracking-[-1px] uppercase">
          {isEdit ? 'Edit Period' : 'Create Period'}
        </DialogTitle>
        <DialogDescription className="text-text-muted text-[11px] uppercase tracking-[1.1px] font-jakarta">
          Life phase boundary // title and date range
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        <PeriodFormFields
          isEdit={isEdit}
          isSubmitting={isSubmitting}
          hasError={hasError}
          errorRegionId={errorRegionId}
          title={title}
          onTitleChange={setTitle}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
        />

        <p
          id={errorRegionId}
          role="alert"
          aria-live="polite"
          className={cn(
            'text-sm text-red-400 min-h-[1.25rem]',
            !hasError && 'sr-only'
          )}
        >
          {errorText ?? ''}
        </p>

        <PeriodFormFooter
          isEdit={isEdit}
          isSubmitting={isSubmitting}
          onCancel={onCancel}
        />
      </form>
    </>
  )
}
