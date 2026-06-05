'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAppSelector } from '@/stores/hooks'
import { Loader } from '@/components/shared/Loader'

const WeeklyCalendar = dynamic(
  () => import('@/components/calendar/calendar-main').then((m) => ({ default: m.WeeklyCalendar })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-[#0e0e0e] text-white h-full w-full flex items-center justify-center p-8">
        <Loader size="lg" label="LOADING CALENDAR // SYNCING EVENTS" />
      </div>
    ),
  }
)

export default function CalendarPage() {
    const router = useRouter()
    const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
    const isLoading = useAppSelector((s) => s.auth.isLoading)
    const isInitialized = useAppSelector((s) => s.auth.isInitialized)

    useEffect(() => {
        if (isInitialized && !isLoading && !isAuthenticated) {
            router.replace('/signup')
        }
    }, [isInitialized, isLoading, isAuthenticated, router])

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
