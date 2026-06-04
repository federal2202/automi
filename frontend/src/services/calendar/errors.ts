/**
 * Calendar service error handling
 */

import { CalendarServiceError, GoogleCalendarError } from '@/types/google-calendar.types'

/**
 * Calendar service error handler
 * Transforms API errors into standardized CalendarServiceError objects
 *
 * @param error - The caught error object
 * @returns Standardized CalendarServiceError
 */
export const handleCalendarServiceError = (error: unknown): CalendarServiceError => {
  // Network/axios error
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: {
        status?: number
        data?: GoogleCalendarError
      }
    }

    if (axiosError.response?.status === 401) {
      return {
        type: 'AUTH_ERROR',
        message: 'Authentication required. Please sign in to access your calendar.',
        originalError: error,
        statusCode: 401
      }
    }

    if (axiosError.response?.status === 403) {
      return {
        type: 'AUTH_ERROR',
        message: 'Insufficient permissions to access calendar data.',
        originalError: error,
        statusCode: 403
      }
    }

    if (axiosError.response?.status === 404) {
      return {
        type: 'VALIDATION_ERROR',
        message: 'Calendar not found.',
        originalError: error,
        statusCode: 404
      }
    }

    return {
      type: 'GOOGLE_API_ERROR',
      message: axiosError.response?.data?.error?.message || 'Google Calendar API error',
      originalError: error,
      statusCode: axiosError.response?.status,
      googleError: axiosError.response?.data
    }
  }

  // Network connection error
  if (error && typeof error === 'object' && 'code' in error) {
    return {
      type: 'NETWORK_ERROR',
      message: 'Network connection failed. Please check your internet connection.',
      originalError: error
    }
  }

  // Unknown error
  return {
    type: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : 'An unknown error occurred',
    originalError: error
  }
}
