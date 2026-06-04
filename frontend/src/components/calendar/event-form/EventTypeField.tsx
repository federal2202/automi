"use client"

import { EventType } from '@/types/calendar/calendar.types'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { eventTypeOptions } from './event-form.utils'

interface EventTypeFieldProps {
  value: EventType
  onChange: (value: EventType) => void
}

/**
 * EventTypeField — the event type <Select> control.
 */
export function EventTypeField({ value, onChange }: EventTypeFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="type" className="text-[#ffffff]/90 font-medium">Event Type</Label>
      <Select value={value} onValueChange={(v: EventType) => onChange(v)}>
        <SelectTrigger className="h-9 rounded-lg !bg-[#ffffff]/5 !border-[#ffffff]/20 px-2.5 py-1 text-white focus:border-green-nice focus:ring-green-nice/30">
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
  )
}
