'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WeeklyCalendar } from '@/components/calendar'
import { useAuthStore } from '@/stores/authStore'
import { Loader } from '@/components/shared/Loader'
import '@/styles/calendar.css'

export default function CalendarPage() {
    const router = useRouter()
    const { isAuthenticated, isLoading, isInitialized } = useAuthStore()

    useEffect(() => {
        // Only redirect once auth has been definitively checked at least once.
        // Without `isInitialized`, the guard can fire on first paint (or on
        // re-navigation before checkAuth resolves) and redirect an
        // authenticated user to /signup.
        if (isInitialized && !isLoading && !isAuthenticated) {
            router.replace('/signup')
        }
    }, [isInitialized, isLoading, isAuthenticated, router])

    // Avoid flashing the calendar before auth state is resolved
    // or while we're about to redirect.
    if (!isInitialized || isLoading || !isAuthenticated) {
        return (
            <div className="bg-[#0e0e0e] text-white h-full w-full flex items-center justify-center p-8">
                <Loader size="lg" label="CHECKING SESSION" />
            </div>
        )
    }

    return (
        <div className="h-full w-full overflow-hidden">
            <WeeklyCalendar />
        </div>
    )
}
