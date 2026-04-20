'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import {
  authApi,
  type User,
  type LoginCredentials,
  type AuthResponse,
  ApiError,
  getErrorMessage,
} from '@/lib/api'

// Hook return type
interface UseAuthReturn {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>
  loginWithGoogle: (code: string) => Promise<boolean>
  logout: () => Promise<void>
  register: (userData: {
    email: string
    password: string
    name: string
  }) => Promise<boolean>
  clearError: () => void
  refreshUser: () => Promise<boolean>
  
  // Utility methods
  checkAuthStatus: () => Promise<boolean>
}

// Login/register response handler
interface AuthActionResult {
  success: boolean
  error?: string
}

/**
 * Custom hook for authentication state management
 * Integrates with Zustand auth store and API service layer
 */
export function useAuth(): UseAuthReturn {
  const {
    user,
    isAuthenticated,
    setUser,
    clearUser,
    setLoading,
    setError,
    clearError: clearStoreError,
  } = useAuthStore()

  // Local loading state for hook-specific operations
  const [isLoading, setIsLoading] = useState(false)
  const [error, setLocalError] = useState<string | null>(null)

  // Clear error helper
  const clearError = useCallback(() => {
    setLocalError(null)
    clearStoreError()
  }, [clearStoreError])

  // Handle authentication response
  const handleAuthResponse = useCallback((response: AuthResponse): AuthActionResult => {
    if (response.success && response.user) {
      setUser(response.user)
      clearError()
      return { success: true }
    } else {
      const errorMessage = response.error || response.message || 'Authentication failed'
      setLocalError(errorMessage)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [setUser, setError, clearError])

  // Login with email/password
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true)
      setLoading(true)
      clearError()

      const response = await authApi.login(credentials)
      const result = handleAuthResponse(response)
      
      return result.success
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      setLocalError(errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
      setLoading(false)
    }
  }, [setLoading, clearError, handleAuthResponse, setError])

  // Login with Google OAuth
  const loginWithGoogle = useCallback(async (code: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      setLoading(true)
      clearError()

      const response = await authApi.loginWithGoogle(code)
      const result = handleAuthResponse(response)
      
      return result.success
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      setLocalError(errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
      setLoading(false)
    }
  }, [setLoading, clearError, handleAuthResponse, setError])

  // Register new user
  const register = useCallback(async (userData: {
    email: string
    password: string
    name: string
  }): Promise<boolean> => {
    try {
      setIsLoading(true)
      setLoading(true)
      clearError()

      const response = await authApi.register(userData)
      const result = handleAuthResponse(response)
      
      return result.success
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      setLocalError(errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
      setLoading(false)
    }
  }, [setLoading, clearError, handleAuthResponse, setError])

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      setLoading(true)

      // Call logout API to clear httpOnly cookies
      await authApi.logout()
    } catch (error) {
      // Even if logout API fails, clear local state
      console.error('Logout API error:', error)
    } finally {
      // Always clear local state
      clearUser()
      clearError()
      setIsLoading(false)
      setLoading(false)
    }
  }, [clearUser, clearError, setLoading])

  // Refresh current user data
  const refreshUser = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearError()

      const response = await authApi.getCurrentUser()
      
      if (response.success && response.user) {
        setUser(response.user)
        return true
      } else {
        // User not authenticated or error occurred
        clearUser()
        return false
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        // Unauthorized - clear user state
        clearUser()
        return false
      }
      
      const errorMessage = getErrorMessage(error)
      setLocalError(errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [setUser, clearUser, clearError, setError])

  // Check authentication status
  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    try {
      const response = await authApi.getCurrentUser()
      
      if (response.success && response.user) {
        setUser(response.user)
        return true
      } else {
        clearUser()
        return false
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearUser()
        return false
      }
      
      // For other errors, don't change auth state but log the error
      console.error('Auth status check error:', error)
      return isAuthenticated
    }
  }, [setUser, clearUser, isAuthenticated])

  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const isAuth = await checkAuthStatus()
        if (!mounted) return

        // If not authenticated but we thought we were, clear state
        if (!isAuth && isAuthenticated) {
          clearUser()
        }
      } catch (error) {
        if (!mounted) return
        console.error('Auth initialization error:', error)
      }
    }

    // Only initialize if we don't have a user but think we're authenticated
    // This handles page refreshes where we lose user data but tokens might still be valid
    if (isAuthenticated && !user) {
      initializeAuth()
    }

    return () => {
      mounted = false
    }
  }, [checkAuthStatus, isAuthenticated, user, clearUser])

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    loginWithGoogle,
    logout,
    register,
    clearError,
    refreshUser,
    checkAuthStatus,
  }
}

// Utility hook for auth state only (no actions)
export function useAuthState() {
  const { user, isAuthenticated } = useAuthStore()
  return { user, isAuthenticated }
}

// Utility hook for checking if user has specific permissions
export function useAuthPermissions() {
  const { user, isAuthenticated } = useAuthStore()
  
  return {
    isAuthenticated,
    isVerified: user?.verified ?? false,
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
  }
}