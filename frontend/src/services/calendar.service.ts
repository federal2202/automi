/**
 * Google Calendar Service
 * Functional implementation of Google Calendar API interactions
 * 
 * @description Pure functions for Google Calendar API calls using axios and TanStack Query
 * @author Frontend Agent 1
 * @version 1.0.0
 */

import { api } from '@/api/axios'
import {
  GoogleCalendarListItem,
  GoogleCalendarListResponse,
  GoogleCalendarItem,
  GoogleEventsResponse,
  CalendarServiceError,
  CalendarSyncOptions
} from '@/types/google-calendar.types'

/**
 * Query parameters for events endpoint
 */
export interface EventsQueryParams {
  readonly calendarId: string
  readonly timeMin?: string
  readonly timeMax?: string
  readonly maxResults?: number
  readonly singleEvents?: boolean
  readonly orderBy?: 'startTime' | 'updated'
  readonly showDeleted?: boolean
  readonly pageToken?: string
}

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
    const axiosError = error as any
    
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

/**
 * Fetches user's calendar list from Google Calendar API
 * 
 * @param maxResults - Maximum number of calendars to retrieve (default: 250)
 * @param pageToken - Token for paginated results
 * @returns Promise resolving to array of calendar list items
 * @throws CalendarServiceError on API failure
 */
export const getCalendars = async (
  maxResults: number = 250,
  pageToken?: string
): Promise<readonly GoogleCalendarListItem[]> => {
  try {
    const params: Record<string, string | number> = {
      maxResults
    }
    
    if (pageToken) {
      params.pageToken = pageToken
    }
    
    const response = await api.get<GoogleCalendarListResponse>('/calendar/calendars', {
      params
    })
    
    return response.data.items
  } catch (error) {
    throw handleCalendarServiceError(error)
  }
}

/**
 * Fetches events from a specific calendar
 * 
 * @param params - Query parameters for events request
 * @returns Promise resolving to array of calendar events
 * @throws CalendarServiceError on API failure
 */
export const getEvents = async (
  params: EventsQueryParams
): Promise<readonly GoogleCalendarItem[]> => {
  try {
    const queryParams: Record<string, string | number | boolean> = {
      calendarId: params.calendarId,
      singleEvents: params.singleEvents ?? true,
      orderBy: params.orderBy ?? 'startTime'
    }
    
    // Add optional parameters
    if (params.timeMin) queryParams.timeMin = params.timeMin
    if (params.timeMax) queryParams.timeMax = params.timeMax
    if (params.maxResults) queryParams.maxResults = params.maxResults
    if (params.showDeleted) queryParams.showDeleted = params.showDeleted
    if (params.pageToken) queryParams.pageToken = params.pageToken
    
    const response = await api.get<GoogleEventsResponse>(
      `/calendar/events`,
      { params: queryParams }
    )
    
    return response.data.items
  } catch (error) {
    throw handleCalendarServiceError(error)
  }
}

/**
 * Creates a new event in the specified calendar
 * 
 * @param calendarId - ID of the calendar to create event in
 * @param eventData - Event data to create
 * @returns Promise resolving to created event
 * @throws CalendarServiceError on API failure
 */
export const createEvent = async (
  calendarId: string,
  eventData: Partial<GoogleCalendarItem>
): Promise<GoogleCalendarItem> => {
  try {
    const response = await api.post<GoogleCalendarItem>(
      '/calendar/events',
      {
        calendarId,
        ...eventData
      }
    )
    
    return response.data
  } catch (error) {
    throw handleCalendarServiceError(error)
  }
}

/**
 * Updates an existing event in the specified calendar
 * 
 * @param calendarId - ID of the calendar containing the event
 * @param eventId - ID of the event to update
 * @param eventData - Updated event data
 * @returns Promise resolving to updated event
 * @throws CalendarServiceError on API failure
 */
export const updateEvent = async (
  calendarId: string,
  eventId: string,
  eventData: Partial<GoogleCalendarItem>
): Promise<GoogleCalendarItem> => {
  try {
    const response = await api.put<GoogleCalendarItem>(
      `/calendar/events/${eventId}`,
      {
        calendarId,
        ...eventData
      }
    )
    
    return response.data
  } catch (error) {
    throw handleCalendarServiceError(error)
  }
}

/**
 * Deletes an event from the specified calendar
 * 
 * @param calendarId - ID of the calendar containing the event
 * @param eventId - ID of the event to delete
 * @returns Promise resolving when deletion is complete
 * @throws CalendarServiceError on API failure
 */
export const deleteEvent = async (
  calendarId: string,
  eventId: string
): Promise<void> => {
  try {
    await api.delete(`/calendar/events/${eventId}`, {
      params: { calendarId }
    })
  } catch (error) {
    throw handleCalendarServiceError(error)
  }
}

/**
 * Syncs multiple calendars with specified options
 * 
 * @param options - Sync configuration options
 * @returns Promise resolving to array of all synced events
 * @throws CalendarServiceError on API failure
 */
export const syncCalendars = async (
  options: CalendarSyncOptions
): Promise<readonly GoogleCalendarItem[]> => {
  try {
    // If no calendar IDs specified, get all calendars first
    const calendarIds = options.calendarIds ?? (await getCalendars()).map(cal => cal.id)
    
    // Fetch events from all calendars in parallel
    const eventPromises = calendarIds.map(calendarId =>
      getEvents({
        calendarId,
        timeMin: options.timeMin,
        timeMax: options.timeMax,
        maxResults: options.maxResults,
        singleEvents: options.singleEvents,
        orderBy: options.orderBy,
        showDeleted: options.showDeleted
      })
    )
    
    const eventArrays = await Promise.all(eventPromises)
    
    // Flatten and return all events
    return eventArrays.flat()
  } catch (error) {
    throw handleCalendarServiceError(error)
  }
}

/**
 * Calendar service factory function
 * Creates an object containing all calendar service functions
 * 
 * @returns Object with calendar service methods
 */
export const createCalendarService = () => ({
  getCalendars,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  syncCalendars,
  handleError: handleCalendarServiceError
} as const)

/**
 * Default calendar service instance
 * Pre-configured service object for immediate use
 */
export const calendarService = createCalendarService()