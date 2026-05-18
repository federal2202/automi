"use client"

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

/**
 * Dashboard-side onboarding redirect guard.
 *
 * Mounted inside the dashboard layout. Once auth has initialized and we
 * know a user is present, checks the server-authoritative
 * `user.onboardingCompletedAt` flag. If it's null/undefined we push the
 * user to `/onboarding` so the wizard is the only thing they can see
 * until they explicitly Skip or Finish.
 *
 * Because the check is a synchronous read off the auth store (no fetch,
 * no `useRef` latch), it re-evaluates correctly when the user object
 * updates after `completeOnboarding()` resolves — the optimistic update
 * keeps the guard from bouncing the user right back as they leave.
 *
 * The component renders nothing.
 */
export function OnboardingGuard() {
  const router = useRouter()
  const pathname = usePathname()
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!isInitialized || !user) return
    if (pathname?.startsWith('/onboarding')) return
    if (!user.onboardingCompletedAt) {
      router.replace('/onboarding')
    }
  }, [isInitialized, user, pathname, router])

  return null
}
