"use client"

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DayPicker } from './DayPicker'
import { FormError } from './FormError'
import { FormFooter } from './FormFooter'
import { RecurringActivityFormBodyProps } from './RecurringActivityForm.types'
import { TimeSection } from './TimeSection'
import { TitleField } from './TitleField'
import { useRecurringActivityForm } from './useRecurringActivityForm'

export function RecurringActivityFormBody({
  initialActivity,
  onCancel,
  onSubmit,
  isSubmitting,
  errorMessage,
}: RecurringActivityFormBodyProps) {
  const form = useRecurringActivityForm({
    initialActivity,
    onSubmit,
    errorMessage,
  })

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-space-grotesk text-2xl tracking-[-1px] uppercase">
          {form.isEdit ? 'Edit Activity' : 'Add Activity'}
        </DialogTitle>
        <DialogDescription className="text-text-muted text-[11px] uppercase tracking-[1.1px] font-jakarta">
          Recurring rule // day + time window inside this period
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={form.handleSubmit} className="flex flex-col gap-4 mt-2">
        <TitleField
          value={form.title}
          onChange={form.setTitle}
          disabled={isSubmitting}
          hasError={form.hasError}
          errorRegionId={form.errorRegionId}
        />

        <DayPicker
          schedule={form.schedule}
          onToggleDay={form.toggleDay}
          disabled={isSubmitting}
          hasError={form.hasError}
          errorRegionId={form.errorRegionId}
        />

        <TimeSection
          sameTimeForAll={form.sameTimeForAll}
          onSameTimeToggle={form.handleSameTimeToggle}
          schedule={form.schedule}
          sortedEntries={form.sortedEntries}
          sharedStart={form.sharedStart}
          sharedEnd={form.sharedEnd}
          onSharedStartChange={form.updateSharedStart}
          onSharedEndChange={form.updateSharedEnd}
          onEntryStartChange={form.updateEntryStart}
          onEntryEndChange={form.updateEntryEnd}
          isSubmitting={isSubmitting}
          hasError={form.hasError}
          errorRegionId={form.errorRegionId}
        />

        <FormError
          errorRegionId={form.errorRegionId}
          errorText={form.errorText}
          hasError={form.hasError}
        />

        <FormFooter
          isEdit={form.isEdit}
          isSubmitting={isSubmitting}
          onCancel={onCancel}
        />
      </form>
    </>
  )
}
