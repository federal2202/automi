"use client"

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { getPeriods } from '@/services/periods.service'

/**
 * Dashboard-side onboarding redirect guard.
 *
 * Mounted inside the dashboard layout. Once auth has initialized and we
 * know a user is present, fetches `/periods` exactly once per session.
 * If the list is empty we push the user to `/onboarding` so the wizard
 * is the only thing they can see until they have at least one period.
 *
 * Design notes:
 *  - We avoid invalidating the `["periods"]` React Query cache: pages that
 *    list periods will populate it via their own `useQuery`. The bare
 *    `getPeriods()` call here is intentionally side-effect free.
 *  - A `useRef` "has-checked" flag prevents an infinite loop when the
 *    layout re-renders mid-check, and stops the API from being hit again
 *    after the user navigates between dashboard subpages.
 *  - Failure is swallowed (console.warn). A transient `/periods` error
 *    should not strand the user on the dashboard with no UI.
 *  - The component renders nothing.
 */
export function OnboardingGuard() {
  const router = useRouter()
  const pathname = usePathname()
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const user = useAuthStore((s) => s.user)
  const hasCheckedRef = useRef(false)

  useEffect(() => {
    if (hasCheckedRef.current) return
    if (!isInitialized || !user) return
    // If we're somehow rendered while sitting on /onboarding (shouldn't
    // happen since the guard is dashboard-scoped, but defensive), don't
    // re-route the user back onto the page they're already on.
    if (pathname?.startsWith('/onboarding')) {
      hasCheckedRef.current = true
      return
    }

    hasCheckedRef.current = true
    void (async () => {
      try {
        const periods = await getPeriods()
        if (!periods || periods.length === 0) {
          router.replace('/onboarding')
        }
      } catch (err) {
        console.warn('OnboardingGuard: failed to fetch periods', err)
      }
    })()
  }, [isInitialized, user, pathname, router])

  return null
}
