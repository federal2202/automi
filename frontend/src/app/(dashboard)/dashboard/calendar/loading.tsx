import { Loader } from '@/components/shared/Loader'

/**
 * Route-level loading boundary for /dashboard/calendar.
 * Renders the branded loader inside the dashboard main content while the
 * route segment streams in. The dashboard sidebar remains mounted/usable.
 */
export default function CalendarLoading() {
    return (
        <div className="-m-4 h-screen overflow-hidden">
            <div className="bg-[#0e0e0e] text-white h-full w-full flex flex-col items-center justify-center p-8">
                <Loader size="lg" label="LOADING CALENDAR // SYNCING EVENTS" />
            </div>
        </div>
    )
}
