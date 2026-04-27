'use client'

import { WeeklyCalendar } from '@/components/calendar'
import '@/styles/calendar.css'

export default function CalendarPage() {
    return (
        <div className="h-full w-full overflow-hidden">
            <WeeklyCalendar />
        </div>
    )
}