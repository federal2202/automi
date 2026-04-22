"use client"

import { useState, useEffect, useCallback } from 'react'
import { useEventManagement } from '@/stores/calendarStore'
import { CalendarEvent, EventType } from '@/types/calendar/calendar.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { cn } from '@/utils/cn'

/**
 * Event Form Data Interface
 * Data structure for form state
 */
interface EventFormData {
  title: string
  start: string // ISO string format for datetime-local input
  end: string // ISO string format for datetime-local input
  type: EventType
  description: string
}

/**
 * Event Form Props Interface
 */
export interface EventFormProps {
  mode: 'create' | 'edit'
  initialData?: CalendarEvent
  selectedSlot?: { start: Date; end: Date }
}

/**
 * EventForm Component
 * 
 * Form for creating and editing calendar events.
 * Uses simple form state with no frontend validation.
 */
export function EventForm({ mode, initialData, selectedSlot }: EventFormProps) {
  const {
    createEvent,
    updateEvent,
    deleteEvent,
    closeModal,
    isLoading,
  } = useEventManagement()

  // Initialize form data based on mode
  const getInitialFormData = useCallback((): EventFormData => {
    if (mode === 'edit' && initialData) {
      return {
        title: initialData.title,
        start: format(initialData.start, "yyyy-MM-dd'T'HH:mm"),
        end: format(initialData.end, "yyyy-MM-dd'T'HH:mm"),
        type: initialData.type,
        description: initialData.description || '',
      }
    }
    
    if (mode === 'create' && selectedSlot) {
      return {
        title: '',
        start: format(selectedSlot.start, "yyyy-MM-dd'T'HH:mm"),
        end: format(selectedSlot.end, "yyyy-MM-dd'T'HH:mm"),
        type: 'primary',
        description: '',
      }
    }
    
    // Fallback for create mode
    const now = new Date()
    const endTime = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour later
    
    return {
      title: '',
      start: format(now, "yyyy-MM-dd'T'HH:mm"),
      end: format(endTime, "yyyy-MM-dd'T'HH:mm"),
      type: 'primary',
      description: '',
    }
  }, [mode, initialData, selectedSlot])

  const [formData, setFormData] = useState<EventFormData>(() => getInitialFormData())

  // Update form data when key props change
  useEffect(() => {
    const newData = getInitialFormData()
    setFormData(newData)
  }, [getInitialFormData])

  /**
   * Handle form field changes
   */
  const handleChange = (field: keyof EventFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Convert form data to event data
    const eventData: Omit<CalendarEvent, 'id'> = {
      title: formData.title,
      start: new Date(formData.start),
      end: new Date(formData.end),
      type: formData.type,
      description: formData.description || undefined,
    }
    
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

  /**
   * Handle event deletion
   */
  const handleDelete = async () => {
    if (mode === 'edit' && initialData && window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(initialData.id)
      } catch (error) {
        console.error('Failed to delete event:', error)
      }
    }
  }

  /**
   * Event type options
   */
  const eventTypeOptions: { value: EventType; label: string }[] = [
    { value: 'primary', label: 'Primary' },
    { value: 'secondary', label: 'Secondary' },
    { value: 'critical', label: 'Critical' },
    { value: 'inactive', label: 'Inactive' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title Field */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-[#ffffff]/90 font-medium">Title</Label>
        <Input
          id="title"
          type="text"
          placeholder="Enter event title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="bg-[#ffffff]/5 border-[#ffffff]/20 text-white placeholder:text-[#ffffff]/50"
          required
        />
      </div>

      {/* Start DateTime Field */}
      <div className="space-y-2">
        <Label htmlFor="start" className="text-[#ffffff]/90 font-medium">Start Date & Time</Label>
        <Input
          id="start"
          type="datetime-local"
          value={formData.start}
          onChange={(e) => handleChange('start', e.target.value)}
          className="bg-[#ffffff]/5 border-[#ffffff]/20 text-white placeholder:text-[#ffffff]/50"
          required
        />
      </div>

      {/* End DateTime Field */}
      <div className="space-y-2">
        <Label htmlFor="end" className="text-[#ffffff]/90 font-medium">End Date & Time</Label>
        <Input
          id="end"
          type="datetime-local"
          value={formData.end}
          onChange={(e) => handleChange('end', e.target.value)}
          className="bg-[#ffffff]/5 border-[#ffffff]/20 text-white placeholder:text-[#ffffff]/50"
          required
        />
      </div>

      {/* Event Type Select */}
      <div className="space-y-2">
        <Label htmlFor="type" className="text-[#ffffff]/90 font-medium">Event Type</Label>
        <Select value={formData.type} onValueChange={(value: EventType) => handleChange('type', value)}>
          <SelectTrigger className="bg-[#ffffff]/5 border-[#ffffff]/20 text-white focus:border-green-nice focus:ring-green-nice/30">
            <SelectValue placeholder="Select event type" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a]/95 backdrop-blur-md border-[#ffffff]/20 rounded-[12px]">
            {eventTypeOptions.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="text-white hover:bg-green-nice/20 focus:bg-green-nice/20 cursor-pointer"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-[#ffffff]/90 font-medium">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Enter event description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="bg-[#ffffff]/5 border-[#ffffff]/20 text-white placeholder:text-[#ffffff]/50 resize-none"
          rows={3}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-between pt-6 border-t border-[#ffffff]/10">
        {mode === 'edit' && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-500/20 hover:bg-red-500/30 border-red-400/30 text-red-300 transition-all duration-200"
          >
            Delete
          </Button>
        )}
        <div className={cn("flex space-x-2", mode === 'create' && "ml-auto")}>
          <Button
            type="button"
            variant="outline"
            onClick={closeModal}
            disabled={isLoading}
            className="bg-[#ffffff]/5 hover:bg-[#ffffff]/10 border-[#ffffff]/20 text-[#ffffff]/80 hover:text-white transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="!bg-green-nice hover:!bg-green-nice/80 !border-green-nice !text-white font-medium"
          >
            {isLoading ? 'Saving...' : (mode === 'create' ? 'Create Event' : 'Update Event')}
          </Button>
        </div>
      </div>
    </form>
  )
}