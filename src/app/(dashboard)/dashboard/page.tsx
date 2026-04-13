import WeeklyCalendar from '@/components/ui/calendar'
import '@/styles/calendar.css'

export default function DashboardPage() {
    return (
        <div className="-m-4 h-screen overflow-hidden">
            <WeeklyCalendar />
        </div>
    )
}