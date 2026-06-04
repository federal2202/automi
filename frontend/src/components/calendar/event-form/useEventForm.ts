"use client"

import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { useEventManagement } from '@/stores/calendarHooks'
import { EventFormData, EventFormProps } from './event-form.types'
import { getInitialFormData, toEventData } from './event-form.utils'

/**
 * Form state + submit/delete logic for the EventForm.
 * Uses simple form state with no frontend validation.
 */
export function useEventForm({ mode, initialData, selectedSlot }: EventFormProps) {
  const { createEvent, updateEvent, deleteEvent, closeModal, isLoading } =
    useEventManagement()

  const buildInitialData = useCallback(
    () => getInitialFormData({ mode, initialData, selectedSlot }),
    [mode, initialData, selectedSlot]
  )

  const [formData, setFormData] = useState<EventFormData>(buildInitialData)

  // Update form data when key props change
  useEffect(() => {
    setFormData(buildInitialData())
  }, [buildInitialData])

  const handleChange = (field: keyof EventFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const eventData = toEventData(formData)

    try {
      if (mode === 'create') {
        await createEvent(eventData)
      } else if (mode === 'edit' && initialData) {
        await updateEvent(initialData.id, eventData)
      }
    } catch (error) {
      // Error handling is managed by the store
      console.error('Failed to save event:', error)
    }
  }

  const handleDelete = async () => {
    if (
      mode === 'edit' &&
      initialData &&
      window.confirm('Are you sure you want to delete this event?')
    ) {
      try {
        await deleteEvent(initialData.id)
      } catch (error) {
        console.error('Failed to delete event:', error)
      }
    }
  }

  return { formData, isLoading, handleChange, handleSubmit, handleDelete, closeModal }
}
