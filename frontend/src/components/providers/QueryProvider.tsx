'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'

interface QueryProviderProps {
  children: ReactNode
}

/**
 * TanStack Query Provider Component
 * Provides React Query functionality to the entire application
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes by default
        staleTime: 5 * 60 * 1000,
        // Keep cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        retry: (failureCount, error: any) => {
          // Don't retry on authentication errors
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            return false
          }
          // Retry up to 2 times for other errors
          return failureCount < 2
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
      },
      mutations: {
        retry: 1,
        retryDelay: 1000
      }
    }
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show dev tools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}