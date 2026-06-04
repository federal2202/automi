"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ActivityTitleFieldProps {
  errorRegionId: string
  hasError: boolean
  isSubmitting: boolean
  title: string
  setTitle: (value: string) => void
}

/** Title input for the wizard's activity step. */
export function ActivityTitleField({
  errorRegionId,
  hasError,
  isSubmitting,
  title,
  setTitle,
}: ActivityTitleFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label
        htmlFor="onboarding-activity-title"
        className="text-[11px] uppercase tracking-[1.1px] text-white/70 font-jakarta"
      >
        Title
      </Label>
      <Input
        id="onboarding-activity-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Morning gym"
        autoFocus
        disabled={isSubmitting}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorRegionId : undefined}
        className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
      />
    </div>
  )
}
