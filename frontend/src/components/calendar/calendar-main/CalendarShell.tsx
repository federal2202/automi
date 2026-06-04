'use client'

import { cn } from '@/utils/cn'
import { CalendarEvent, CalendarView } from '@/types/calendar/calendar.types'
import { CalendarToolbar } from '../CalendarToolbar'
import { CalendarGrid } from '../CalendarGrid'
import { FloatingChatButton } from '../FloatingChatButton'
import { EventModal } from '../EventModal'
import { DeleteConfirmationDialog } from '../DeleteConfirmationDialog'
import { CalendarErrorBanner } from './CalendarErrorBanner'

interface ToolbarCalendar {
  id: string
  summary: string
  primary?: boolean
  backgroundColor?: string
  foregroundColor?: string
}

interface CalendarShellProps {
  className?: string
  currentDate: Date
  view: CalendarView
  events: CalendarEvent[]
  calendars: ToolbarCalendar[]
  showError: boolean
  staggerMap: Map<string, number> | null
  isDeleteDialogOpen: boolean
  eventToDelete: CalendarEvent | null
  onRetry: () => void
  onNavigate: (direction: 'prev' | 'next') => void
  onViewChange: (view: CalendarView) => void
  onDateChange: (date: Date) => void
  onCloseDelete: () => void
}

/**
 * CalendarShell — the rendered calendar layout (post-loading).
 */
export function CalendarShell({
  className,
  currentDate,
  view,
  events,
  calendars,
  showError,
  staggerMap,
  isDeleteDialogOpen,
  eventToDelete,
  onRetry,
  onNavigate,
  onViewChange,
  onDateChange,
  onCloseDelete,
}: CalendarShellProps) {
  return (
    <div
      className={cn(
        'bg-[#0e0e0e] text-white h-full w-full flex flex-col p-2 sm:p-4 md:p-6 lg:p-8',
        className
      )}
    >
      {showError && <CalendarErrorBanner onRetry={onRetry} />}

      <CalendarToolbar
        currentDate={currentDate}
        view={view}
        calendars={calendars}
        onNavigate={onNavigate}
        onViewChange={onViewChange}
        onDateChange={onDateChange}
      />

      <CalendarGrid
        currentDate={currentDate}
        view={view}
        events={events}
        onViewChange={onViewChange}
        onDateChange={onDateChange}
        staggerMap={staggerMap}
      />

      <FloatingChatButton />
      <EventModal />

      {eventToDelete && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={onCloseDelete}
          event={eventToDelete}
        />
      )}
    </div>
  )
}
