"use client"

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/api/axios'
import { useAppDispatch } from '@/stores/hooks'
import { logout as logoutAction } from '@/stores/authSlice'

interface UseLogoutResult {
  logout: () => Promise<void>
  isPending: boolean
}

/**
 * Encapsulates the sign-out flow:
 *   1. Best-effort `POST /auth/logout` to clear the httpOnly session cookie.
 *      Network/server failures are swallowed — we still log out locally.
 *   2. Clear Redux auth state (`logout()`), so guards won't bounce us back.
 *   3. Redirect to the canonical unauthenticated route (`/signup`).
 */
export function useLogout(): UseLogoutResult {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const logout = useCallback(async () => {
    setIsPending(true)
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore — the local sign-out below must proceed regardless.
    }
    dispatch(logoutAction())
    router.replace('/signup')
  }, [dispatch, router])

  return { logout, isPending }
}
