"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PeriodFieldsProps {
  errorRegionId: string
  hasError: boolean
  isSubmitting: boolean
  title: string
  setTitle: (value: string) => void
  startDate: string
  setStartDate: (value: string) => void
  endDate: string
  setEndDate: (value: string) => void
}

const labelClass =
  'text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta'

/** Title + start/end date inputs for the wizard's period step. */
export function PeriodFields({
  errorRegionId,
  hasError,
  isSubmitting,
  title,
  setTitle,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: PeriodFieldsProps) {
  const describedBy = hasError ? errorRegionId : undefined
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="onboarding-period-title" className={labelClass}>
          Title
        </Label>
        <Input
          id="onboarding-period-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Fall Semester"
          autoFocus
          disabled={isSubmitting}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="onboarding-period-start" className={labelClass}>
            Start Date
          </Label>
          <Input
            id="onboarding-period-start"
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isSubmitting}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="onboarding-period-end" className={labelClass}>
            End Date
          </Label>
          <Input
            id="onboarding-period-end"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isSubmitting}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>
    </>
  )
}
