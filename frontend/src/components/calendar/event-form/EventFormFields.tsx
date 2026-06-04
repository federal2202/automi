"use client"

import { EventType } from '@/types/calendar/calendar.types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EventFormData } from './event-form.types'
import { EventTypeField } from './EventTypeField'

const inputClass =
  'rounded-lg !bg-[#ffffff]/5 !border-[#ffffff]/20 text-white placeholder:text-[#ffffff]/50'
const dateTimeClass =
  '[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer'

interface EventFormFieldsProps {
  mode: 'create' | 'edit'
  formData: EventFormData
  onChange: (field: keyof EventFormData, value: string | boolean) => void
}

/**
 * EventFormFields — all input controls for the event form.
 */
export function EventFormFields({ mode, formData, onChange }: EventFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title" className="text-[#ffffff]/90 font-medium">Title</Label>
        <Input
          id="title"
          type="text"
          placeholder="Enter event title"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          className={inputClass}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="start" className="text-[#ffffff]/90 font-medium">Start Date & Time</Label>
        <Input
          id="start"
          type="datetime-local"
          value={formData.start}
          onChange={(e) => onChange('start', e.target.value)}
          className={`${inputClass} ${dateTimeClass}`}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="end" className="text-[#ffffff]/90 font-medium">End Date & Time</Label>
        <Input
          id="end"
          type="datetime-local"
          value={formData.end}
          onChange={(e) => onChange('end', e.target.value)}
          className={`${inputClass} ${dateTimeClass}`}
          required
        />
      </div>

      <EventTypeField
        value={formData.type}
        onChange={(v: EventType) => onChange('type', v)}
      />

      <div className="space-y-2">
        <Label htmlFor="description" className="text-[#ffffff]/90 font-medium">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Enter event description"
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          className="rounded-lg !bg-[#ffffff]/5 !border-[#ffffff]/20 px-2.5 py-1.5 text-white placeholder:text-[#ffffff]/50 resize-none"
          rows={3}
        />
      </div>

      {mode === 'create' && (
        <div className="flex items-center gap-2">
          <input
            id="isTask"
            type="checkbox"
            checked={formData.isTask}
            onChange={(e) => onChange('isTask', e.target.checked)}
            className="h-4 w-4 rounded border-[#ffffff]/20 bg-[#ffffff]/5 accent-green-500 cursor-pointer"
          />
          <Label htmlFor="isTask" className="text-[#ffffff]/90 font-medium cursor-pointer">
            Task
          </Label>
        </div>
      )}
    </>
  )
}
