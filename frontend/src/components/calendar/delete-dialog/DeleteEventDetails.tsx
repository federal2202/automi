"use client"

import { format } from 'date-fns'
import { CalendarEvent } from '@/types/calendar/calendar.types'

interface DeleteEventDetailsProps {
  event: CalendarEvent
}

/**
 * DeleteEventDetails — read-only summary of the event being deleted.
 */
export function DeleteEventDetails({ event }: DeleteEventDetailsProps) {
  return (
    <div className="space-y-3 py-4">
      <div>
        <span className="font-medium text-sm text-muted-foreground">Title:</span>
        <p className="text-sm">{event.title}</p>
      </div>

      <div>
        <span className="font-medium text-sm text-muted-foreground">Date & Time:</span>
        <p className="text-sm">
          {format(event.start, 'PPP')} at {format(event.start, 'p')} -{' '}
          {format(event.end, 'p')}
        </p>
      </div>

      <div>
        <span className="font-medium text-sm text-muted-foreground">Type:</span>
        <p className="text-sm capitalize">{event.type}</p>
      </div>

      {event.description && (
        <div>
          <span className="font-medium text-sm text-muted-foreground">Description:</span>
          <p className="text-sm">{event.description}</p>
        </div>
      )}
    </div>
  )
}
