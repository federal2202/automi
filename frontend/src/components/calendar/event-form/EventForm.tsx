"use client"

import { EventFormProps } from './event-form.types'
import { useEventForm } from './useEventForm'
import { EventFormFields } from './EventFormFields'
import { EventFormActions } from './EventFormActions'

/**
 * EventForm Component
 *
 * Form for creating and editing calendar events.
 * Composes field group + action footer over the useEventForm hook.
 */
export function EventForm({ mode, initialData, selectedSlot }: EventFormProps) {
  const { formData, isLoading, handleChange, handleSubmit, handleDelete, closeModal } =
    useEventForm({ mode, initialData, selectedSlot })

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <EventFormFields mode={mode} formData={formData} onChange={handleChange} />
      <EventFormActions
        mode={mode}
        isLoading={isLoading}
        onCancel={closeModal}
        onDelete={handleDelete}
      />
    </form>
  )
}
