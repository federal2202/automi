"use client"

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { CreatePeriodInput, Period } from '@/types/period'
import { PeriodFormBody } from './period-form/PeriodFormBody'

interface PeriodFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialPeriod?: Period | null
  onSubmit: (input: CreatePeriodInput) => Promise<void> | void
  isSubmitting?: boolean
  errorMessage?: string | null
}

export function PeriodFormDialog({
  open,
  onOpenChange,
  initialPeriod,
  onSubmit,
  isSubmitting,
  errorMessage,
}: PeriodFormDialogProps) {
  // The form body is remounted (via `key`) whenever the dialog opens with a
  // different period, so its local state can be seeded lazily from props and
  // we don't need an effect that calls setState (which lint forbids).
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-bg-surface border border-white/10 text-white">
        {open && (
          <PeriodFormBody
            key={initialPeriod?.id ?? 'create'}
            initialPeriod={initialPeriod ?? null}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage ?? null}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
