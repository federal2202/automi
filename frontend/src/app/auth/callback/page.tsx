'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [userInfo, setUserInfo] = useState<{ name?: string; email?: string }>({})
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginWithGoogle, user, isAuthenticated } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code from URL
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const state = searchParams.get('state')

        // Handle OAuth errors
        if (error) {
          const errorMsg = error === 'access_denied' 
            ? 'Sign-in was cancelled' 
            : `Authentication error: ${error}`
          setErrorMessage(errorMsg)
          setStatus('error')
          return
        }

        // Validate required parameters
        if (!code) {
          setErrorMessage('No authorization code received')
          setStatus('error')
          return
        }

        // Parse redirect destination from state
        let redirectTo = '/dashboard'
        if (state) {
          try {
            const stateData = JSON.parse(atob(state))
            redirectTo = stateData.redirectTo || '/dashboard'
          } catch (e) {
            console.warn('Failed to parse state parameter:', e)
          }
        }

        // Attempt login with the authorization code
        const success = await loginWithGoogle(code)

        if (success) {
          setStatus('success')
          
          // Wait a moment to show success state, then redirect
          setTimeout(() => {
            router.replace(redirectTo)
          }, 1500)
        } else {
          setErrorMessage('Authentication failed. Please try again.')
          setStatus('error')
        }

      } catch (err) {
        console.error('Callback handling error:', err)
        setErrorMessage(
          err instanceof Error ? err.message : 'An unexpected error occurred'
        )
        setStatus('error')
      }
    }

    handleCallback()
  }, [searchParams, loginWithGoogle, router])

  // Update user info when user data becomes available
  useEffect(() => {
    if (user) {
      setUserInfo({ name: user.name, email: user.email })
    }
  }, [user])

  const handleRetry = () => {
    router.push('/')
  }

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-[#ffffff]/2 backdrop-blur-sm border border-[#ffffff]/10 rounded-2xl p-8 text-center">
          
          {/* Loading State */}
          {status === 'loading' && (
            <div className="animate-fade-in-up">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-nice/20 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-green-nice animate-spin" />
              </div>
              <h1 className="text-xl font-semibold text-foreground mb-2">
                Signing you in...
              </h1>
              <p className="text-sm text-muted-foreground">
                Please wait while we complete your authentication
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="animate-fade-in-up">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-nice/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-nice" />
              </div>
              <h1 className="text-xl font-semibold text-foreground mb-2">
                Welcome back{userInfo.name ? `, ${userInfo.name.split(' ')[0]}` : ''}!
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                You have been successfully signed in{userInfo.email && (
                  <><br />as {userInfo.email}</>
                )}
              </p>
              <div className="w-full bg-green-nice/20 rounded-full h-2 mb-4">
                <div className="bg-green-nice h-2 rounded-full animate-pulse" style={{ width: '100%' }} />
              </div>
              <p className="text-xs text-muted-foreground">
                Redirecting to dashboard...
              </p>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="animate-fade-in-up">
              <div className="w-16 h-16 mx-auto mb-6 bg-destructive/20 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-xl font-semibold text-foreground mb-2">
                Authentication Failed
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                {errorMessage || 'Something went wrong during sign-in'}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full bg-green-nice text-white rounded-lg h-12 font-medium hover:bg-green-600 transition-colors"
                >
                  Try Again
                </button>
                {isAuthenticated && (
                  <button
                    onClick={handleGoToDashboard}
                    className="w-full bg-[#ffffff]/2 border border-[#ffffff]/10 text-white rounded-lg h-12 font-medium hover:bg-[#ffffff]/5 transition-colors"
                  >
                    Go to Dashboard
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg text-xs">
            <div className="text-muted-foreground">
              Debug: {status} | Code: {searchParams.get('code')?.slice(0, 20)}...
              {searchParams.get('error') && ` | Error: ${searchParams.get('error')}`}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}