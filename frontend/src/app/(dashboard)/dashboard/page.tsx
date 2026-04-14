import WeeklyCalendar from '@/components/ui/calendar'
import '@/styles/calendar.css'

export default function DashboardPage() {
    return (
        <div className="h-full w-full flex flex-col flex-1">
            <WeeklyCalendar className="flex-1" />
        </div>
    )
}