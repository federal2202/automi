'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User } from '@/lib/api'

interface AuthStore {
  // Auth state
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setUser: (user: User | null) => void
  clearUser: () => void
  setAuthenticated: (isAuthenticated: boolean) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Enhanced actions for token management
  initializeAuth: () => void
  resetAuthState: () => void
}

/**
 * Authentication State Management with Zustand
 * Enhanced store with loading states, error handling, and token management
 * Uses session storage for auth state persistence (not tokens - those are httpOnly cookies)
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Basic actions
      setUser: (user: User | null) => {
        set({ 
          user,
          isAuthenticated: user !== null,
          error: null // Clear any previous errors on successful user set
        })
      },

      clearUser: () => {
        set({ 
          user: null,
          isAuthenticated: false,
          error: null,
          isLoading: false
        })
      },

      setAuthenticated: (isAuthenticated: boolean) => {
        set({ isAuthenticated })
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },

      // Enhanced actions
      initializeAuth: () => {
        // Reset to initial state but preserve any existing user data
        const currentUser = get().user
        set({
          isLoading: false,
          error: null,
          // Keep user and isAuthenticated if user exists
          isAuthenticated: !!currentUser
        })
      },

      resetAuthState: () => {
        // Complete reset to initial state
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        })
      },
    }),
    {
      name: 'auth-storage',
      // Only persist user data and auth status, not loading/error states
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLoading: false,
        error: null,
        setUser: state.setUser,
        clearUser: state.clearUser,
        setAuthenticated: state.setAuthenticated,
        setLoading: state.setLoading,
        setError: state.setError,
        clearError: state.clearError,
        initializeAuth: state.initializeAuth,
        resetAuthState: state.resetAuthState,
      }),
      // Use sessionStorage for better security (clears on tab close)
      storage: createJSONStorage(() => 
        typeof window !== 'undefined' ? sessionStorage : ({} as Storage)
      ),
      // Skip hydration in SSR
      skipHydration: typeof window === 'undefined',
    }
  )
)

/**
 * Hook to access auth state (read-only)
 */
export const useAuthState = () => {
  const store = useAuthStore()
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
  }
}

/**
 * Hook to access auth actions
 */
export const useAuthActions = () => {
  const store = useAuthStore()
  return {
    setUser: store.setUser,
    clearUser: store.clearUser,
    setAuthenticated: store.setAuthenticated,
    setLoading: store.setLoading,
    setError: store.setError,
    clearError: store.clearError,
    initializeAuth: store.initializeAuth,
    resetAuthState: store.resetAuthState,
  }
}

/**
 * Hook to access complete auth store (state + actions)
 * Use this when you need both state and actions in the same component
 */
export const useAuthComplete = () => {
  return useAuthStore()
}

