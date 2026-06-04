"use client"

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { RecurringActivityFormBody } from './recurring-activity-form/RecurringActivityFormBody'
import { RecurringActivityFormDialogProps } from './recurring-activity-form/RecurringActivityForm.types'

export function RecurringActivityFormDialog({
  open,
  onOpenChange,
  initialActivity,
  onSubmit,
  isSubmitting,
  errorMessage,
}: RecurringActivityFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-bg-surface border border-white/10 text-white">
        {open && (
          <RecurringActivityFormBody
            key={initialActivity?.id ?? 'create'}
            initialActivity={initialActivity ?? null}
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
