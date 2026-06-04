"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PeriodFormFieldsProps {
  isEdit: boolean
  isSubmitting?: boolean
  hasError: boolean
  errorRegionId: string
  title: string
  onTitleChange: (value: string) => void
  startDate: string
  onStartDateChange: (value: string) => void
  endDate: string
  onEndDateChange: (value: string) => void
}

const labelClass =
  'text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta'

/** Title input + start/end date range inputs for the period form. */
export function PeriodFormFields({
  isEdit,
  isSubmitting,
  hasError,
  errorRegionId,
  title,
  onTitleChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}: PeriodFormFieldsProps) {
  const describedBy = hasError ? errorRegionId : undefined
  const invalid = hasError || undefined

  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="period-title" className={labelClass}>
          Title
        </Label>
        <Input
          id="period-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="e.g. Sabbatical 2026"
          autoFocus
          disabled={isSubmitting}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
        />
      </div>

      {isEdit && (
        <p className="text-[11px] text-text-muted tracking-[0.4px] font-jakarta -mb-2">
          Changing dates will sync Google Calendar events accordingly.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="period-start" className={labelClass}>
            Start Date
          </Label>
          <Input
            id="period-start"
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => onStartDateChange(e.target.value)}
            disabled={isSubmitting}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="period-end" className={labelClass}>
            End Date
          </Label>
          <Input
            id="period-end"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => onEndDateChange(e.target.value)}
            disabled={isSubmitting}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>
    </>
  )
}
