"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SharedTimeFieldsProps {
  errorRegionId: string
  hasError: boolean
  isSubmitting: boolean
  disabled: boolean
  sharedStart: string
  sharedEnd: string
  updateSharedStart: (value: string) => void
  updateSharedEnd: (value: string) => void
}

const labelClass =
  'text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta'

/** Single start/end pair applied to every selected day ("same time" mode). */
export function SharedTimeFields({
  errorRegionId,
  hasError,
  isSubmitting,
  disabled,
  sharedStart,
  sharedEnd,
  updateSharedStart,
  updateSharedEnd,
}: SharedTimeFieldsProps) {
  const describedBy = hasError ? errorRegionId : undefined
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="onboarding-activity-start" className={labelClass}>
          Start Time
        </Label>
        <Input
          id="onboarding-activity-start"
          type="time"
          value={sharedStart}
          max={sharedEnd || undefined}
          onChange={(e) => updateSharedStart(e.target.value)}
          disabled={isSubmitting || disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className="bg-white/5 border-white/10 text-white"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="onboarding-activity-end" className={labelClass}>
          End Time
        </Label>
        <Input
          id="onboarding-activity-end"
          type="time"
          value={sharedEnd}
          min={sharedStart || undefined}
          onChange={(e) => updateSharedEnd(e.target.value)}
          disabled={isSubmitting || disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className="bg-white/5 border-white/10 text-white"
        />
      </div>
    </div>
  )
}
