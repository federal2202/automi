# Google Calendar Integration Plan

**Generated**: 2026-04-22  
**For**: Frontend Team using Axios, TanStack Query, and SOLID architecture  
**Backend Endpoints**: `http://localhost:8000/calendar/calendars` & `http://localhost:8000/calendar/events`

## 🎯 Integration Overview

Replace current sample data system with Google Calendar API integration while maintaining existing UI/UX patterns. Your current calendar system is production-ready and only needs data layer replacement.

**Current System Assessment**: ✅ 8/10 - Excellent foundation  
**Integration Complexity**: 🟡 Medium - Mainly data transformation  
**Timeline Estimate**: 2-3 days

## 📊 Data Flow Architecture

```
Google Calendar API → Backend → Frontend API Layer → TanStack Query → Zustand Store → React Components
```

**Authentication**: httpOnly cookies (already configured) ✅  
**Error Handling**: Existing patterns work perfectly ✅  
**Loading States**: Already implemented ✅  
**Optimistic Updates**: Current system compatible ✅

## 🔄 Current vs Google Calendar Data Mapping

### Your Current CalendarEvent Interface
```typescript
interface CalendarEvent {
  id: string
  title: string
  start: Date  
  end: Date
  type: 'primary' | 'secondary' | 'critical' | 'inactive'
  description?: string
}
```

### Google Calendar API Response Format
```json
{
  "items": [
    {
      "id": "event123456789",
      "summary": "Team Meeting",
      "description": "Weekly team sync", 
      "start": {
        "dateTime": "2025-04-22T14:00:00-07:00"
      },
      "end": {
        "dateTime": "2025-04-22T15:00:00-07:00"
      },
      "colorId": "7"
    }
  ]
}
```

**Perfect Mapping**: ✅ All fields align directly  
**Transformation Required**: 🟡 Basic field mapping only

## 🏗️ Implementation Plan

### Phase 1: API Service Layer (Day 1)

#### 1.1 Create Calendar API Service with TanStack Query

**File**: `src/services/calendar.service.ts`
```typescript
import { api } from '@/api/axios' // Your existing axios instance
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CalendarEvent } from '@/types/calendar'

// Google Calendar API Response Types
interface GoogleCalendarListResponse {
  items: Array<{
    id: string
    summary: string
    backgroundColor?: string
    foregroundColor?: string
    primary?: boolean
    accessRole: string
  }>
}

interface GoogleEventsResponse {
  items: Array<{
    id: string
    summary: string
    description?: string
    start: {
      dateTime?: string
      date?: string
      timeZone?: string
    }
    end: {
      dateTime?: string  
      date?: string
      timeZone?: string
    }
    colorId?: string
    status: string
  }>
}

// Query Keys
export const calendarKeys = {
  all: ['calendar'] as const,
  calendars: () => [...calendarKeys.all, 'calendars'] as const,
  events: () => [...calendarKeys.all, 'events'] as const,
  eventsByCalendar: (calendarId: string) => [...calendarKeys.events(), calendarId] as const,
}

// API Functions
const calendarApi = {
  getCalendars: async (): Promise<GoogleCalendarListResponse> => {
    const response = await api.get('/calendar/calendars')
    return response.data
  },

  getEvents: async (params?: {
    calendarId?: string
    timeMin?: string
    timeMax?: string
  }): Promise<GoogleEventsResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.calendarId) searchParams.append('calendarId', params.calendarId)
    if (params?.timeMin) searchParams.append('timeMin', params.timeMin)
    if (params?.timeMax) searchParams.append('timeMax', params.timeMax)
    
    const response = await api.get(`/calendar/events?${searchParams}`)
    return response.data
  }
}

// TanStack Query Hooks
export const useCalendars = () => {
  return useQuery({
    queryKey: calendarKeys.calendars(),
    queryFn: calendarApi.getCalendars,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  })
}

export const useEvents = (params?: {
  calendarId?: string
  timeMin?: Date
  timeMax?: Date
}) => {
  const queryParams = params ? {
    calendarId: params.calendarId,
    timeMin: params.timeMin?.toISOString(),
    timeMax: params.timeMax?.toISOString(),
  } : undefined

  return useQuery({
    queryKey: calendarKeys.eventsByCalendar(params?.calendarId || 'primary'),
    queryFn: () => calendarApi.getEvents(queryParams),
    staleTime: 2 * 60 * 1000, // 2 minutes (events change more frequently)
    gcTime: 5 * 60 * 1000,    // 5 minutes
  })
}

export { calendarApi }
```

#### 1.2 Add TanStack Query Setup to App

**File**: `src/app/layout.tsx` (add QueryClient provider)
```typescript
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute default
        retry: (failureCount, error: any) => {
          // Don't retry on auth errors
          if (error?.response?.status === 401) return false
          return failureCount < 3
        }
      },
      mutations: {
        retry: 1
      }
    }
  }))

  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthInitializer />
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  )
}
```

### Phase 2: Data Transformation Layer (Day 1-2)

#### 2.1 Create Transformation Utilities

**File**: `src/utils/calendar-transform.utils.ts`
```typescript
import type { CalendarEvent } from '@/types/calendar'

// Map Google Calendar colorId to your event types
const COLOR_TO_TYPE_MAP: Record<string, CalendarEvent['type']> = {
  '1': 'primary',    // Lavender
  '2': 'secondary',  // Sage  
  '3': 'critical',   // Grape
  '4': 'critical',   // Flamingo
  '5': 'secondary',  // Banana
  '6': 'primary',    // Tangerine
  '7': 'secondary',  // Peacock
  '8': 'inactive',   // Graphite
  '9': 'primary',    // Blueberry
  '10': 'secondary', // Basil
  '11': 'critical',  // Tomato
}

export const transformGoogleEventToCalendarEvent = (
  googleEvent: any
): CalendarEvent => {
  // Handle both timed and all-day events
  const start = googleEvent.start.dateTime 
    ? new Date(googleEvent.start.dateTime)
    : new Date(googleEvent.start.date + 'T00:00:00')
    
  const end = googleEvent.end.dateTime
    ? new Date(googleEvent.end.dateTime)  
    : new Date(googleEvent.end.date + 'T23:59:59')

  return {
    id: googleEvent.id,
    title: googleEvent.summary || '(No title)',
    start,
    end,
    type: COLOR_TO_TYPE_MAP[googleEvent.colorId] || 'primary',
    description: googleEvent.description || undefined,
  }
}

export const transformGoogleEventsToCalendarEvents = (
  googleResponse: any
): CalendarEvent[] => {
  return googleResponse.items
    ?.filter((event: any) => event.status !== 'cancelled')
    ?.map(transformGoogleEventToCalendarEvent) || []
}

// Reverse transformation for creating/updating events (future use)
export const transformCalendarEventToGoogleEvent = (
  calendarEvent: Omit<CalendarEvent, 'id'>
) => {
  const typeToColorMap = Object.fromEntries(
    Object.entries(COLOR_TO_TYPE_MAP).map(([k, v]) => [v, k])
  )

  return {
    summary: calendarEvent.title,
    description: calendarEvent.description,
    start: {
      dateTime: calendarEvent.start.toISOString(),
    },
    end: {
      dateTime: calendarEvent.end.toISOString(),
    },
    colorId: typeToColorMap[calendarEvent.type] || '1'
  }
}

// Date range utilities for API queries
export const getCalendarDateRange = (currentDate: Date, view: string) => {
  const start = new Date(currentDate)
  const end = new Date(currentDate)
  
  switch (view) {
    case 'month':
      start.setDate(1)
      end.setMonth(end.getMonth() + 1, 0)
      break
    case 'week':
      const dayOfWeek = start.getDay()
      start.setDate(start.getDate() - dayOfWeek)
      end.setDate(start.getDate() + 6)
      break
    case 'day':
      end.setDate(end.getDate() + 1)
      break
    default:
      // Month view as default
      start.setDate(1)
      end.setMonth(end.getMonth() + 1, 0)
  }
  
  return { timeMin: start, timeMax: end }
}
```

### Phase 3: Store Integration (Day 2)

#### 3.1 Update Zustand Store to Use TanStack Query

**File**: `src/stores/calendarStore.ts` (update existing file)
```typescript
import { create } from 'zustand'
import type { CalendarEvent, CalendarView } from '@/types/calendar'
import { useEvents, useCalendars } from '@/services/calendar.service'
import { 
  transformGoogleEventsToCalendarEvents,
  getCalendarDateRange 
} from '@/utils/calendar-transform.utils'

// Remove events from store state - now managed by TanStack Query
interface CalendarStore {
  // Keep UI state only
  currentDate: Date
  view: CalendarView
  selectedCalendarId: string
  
  // Modal state (keep existing)
  isEventModalOpen: boolean
  isCreateMode: boolean
  selectedEventId: string | null
  selectedSlot: { start: Date; end: Date } | null
  
  // UI Actions (keep existing)
  setCurrentDate: (date: Date) => void
  setView: (view: CalendarView) => void
  setSelectedCalendar: (calendarId: string) => void
  openEventModal: (mode: 'create' | 'edit', eventId?: string) => void
  closeEventModal: () => void
  setSelectedSlot: (slot: { start: Date; end: Date } | null) => void
  
  // Navigation (keep existing methods)
  navigateToNext: () => void
  navigateToPrevious: () => void
  navigateToToday: () => void
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  // Initial state
  currentDate: new Date(),
  view: 'month' as CalendarView,
  selectedCalendarId: 'primary',
  
  isEventModalOpen: false,
  isCreateMode: true,
  selectedEventId: null,
  selectedSlot: null,
  
  // Actions (keep all existing UI actions)
  setCurrentDate: (date) => set({ currentDate: date }),
  setView: (view) => set({ view }),
  setSelectedCalendar: (calendarId) => set({ selectedCalendarId: calendarId }),
  
  // Modal management (keep existing)
  openEventModal: (mode, eventId) => set({
    isEventModalOpen: true,
    isCreateMode: mode === 'create',
    selectedEventId: eventId || null
  }),
  closeEventModal: () => set({
    isEventModalOpen: false,
    selectedEventId: null,
    selectedSlot: null
  }),
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
  
  // Navigation (keep existing methods but remove direct event manipulation)
  navigateToNext: () => {
    const { currentDate, view } = get()
    const newDate = new Date(currentDate)
    
    switch (view) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1)
        break
      case 'week':
        newDate.setDate(newDate.getDate() + 7)
        break
      case 'day':
        newDate.setDate(newDate.getDate() + 1)
        break
    }
    
    set({ currentDate: newDate })
  },
  
  navigateToPrevious: () => {
    const { currentDate, view } = get()
    const newDate = new Date(currentDate)
    
    switch (view) {
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1)
        break
      case 'week':
        newDate.setDate(newDate.getDate() - 7)
        break
      case 'day':
        newDate.setDate(newDate.getDate() - 1)
        break
    }
    
    set({ currentDate: newDate })
  },
  
  navigateToToday: () => set({ currentDate: new Date() }),
}))

// Create new custom hooks that combine Zustand + TanStack Query
export const useCalendarEvents = () => {
  const { currentDate, view, selectedCalendarId } = useCalendarStore()
  const { timeMin, timeMax } = getCalendarDateRange(currentDate, view)
  
  const {
    data: googleEventsResponse,
    isLoading,
    error,
    refetch
  } = useEvents({
    calendarId: selectedCalendarId,
    timeMin,
    timeMax
  })
  
  const events = googleEventsResponse 
    ? transformGoogleEventsToCalendarEvents(googleEventsResponse)
    : []
    
  return {
    events,
    isLoading,
    error,
    refetch
  }
}

export const useCalendarData = () => {
  const {
    data: calendarsResponse,
    isLoading: calendarsLoading,
    error: calendarsError
  } = useCalendars()
  
  return {
    calendars: calendarsResponse?.items || [],
    isLoading: calendarsLoading,
    error: calendarsError
  }
}

// Keep existing specialized hooks but update to use new structure
export const useCalendarState = () => {
  const { currentDate, view, selectedCalendarId } = useCalendarStore()
  return { currentDate, view, selectedCalendarId }
}

export const useCalendarUIState = () => {
  const { 
    isEventModalOpen, 
    isCreateMode, 
    selectedEventId, 
    selectedSlot 
  } = useCalendarStore()
  return { isEventModalOpen, isCreateMode, selectedEventId, selectedSlot }
}

export const useCalendarActions = () => {
  const {
    setCurrentDate,
    setView,
    setSelectedCalendar,
    openEventModal,
    closeEventModal,
    setSelectedSlot,
    navigateToNext,
    navigateToPrevious,
    navigateToToday
  } = useCalendarStore()
  
  return {
    setCurrentDate,
    setView,
    setSelectedCalendar,
    openEventModal,
    closeEventModal,
    setSelectedSlot,
    navigateToNext,
    navigateToPrevious,
    navigateToToday
  }
}
```

### Phase 4: Component Updates (Day 2-3)

#### 4.1 Update Main Calendar Component

**File**: `src/components/calendar/Calendar.tsx` (minimal changes needed)
```typescript
'use client'
import { useEffect } from 'react'
import { Calendar as BigCalendar } from 'react-big-calendar'
import { CalendarGrid } from './components/CalendarGrid'
import { CalendarToolbar } from './components/CalendarToolbar'
import { EventModal } from './components/EventModal'
import { DeleteConfirmationDialog } from './components/DeleteConfirmationDialog'
import { 
  useCalendarStore, 
  useCalendarEvents, // ← New hook
  useCalendarData     // ← New hook  
} from '@/stores/calendarStore'

interface CalendarProps {
  initialDate?: Date
  initialView?: 'month' | 'week' | 'day'
}

export function Calendar({ initialDate = new Date(), initialView = 'month' }: CalendarProps) {
  const { setCurrentDate, setView } = useCalendarStore()
  
  // Use new hooks that integrate TanStack Query
  const { events, isLoading, error } = useCalendarEvents()
  const { calendars, isLoading: calendarsLoading } = useCalendarData()

  useEffect(() => {
    setCurrentDate(initialDate)
    setView(initialView)
  }, []) // Keep empty dependency array

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading calendar...</div>
      </div>
    )
  }

  // Show error state  
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-red-600">
          Error loading calendar: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="calendar-container">
      <CalendarToolbar calendars={calendars} />
      <CalendarGrid events={events} />
      <EventModal />
      <DeleteConfirmationDialog />
    </div>
  )
}
```

#### 4.2 Update CalendarGrid Component

**File**: `src/components/calendar/components/CalendarGrid.tsx` (minimal changes)
```typescript
// Only change needed: remove events prop from useCalendarStore
// Events now come from props passed down from Calendar component

interface CalendarGridProps {
  events: CalendarEvent[] // ← Add this prop
}

export const CalendarGrid = ({ events }: CalendarGridProps) => {
  // Remove: const { events } = useCalendarStore()
  // Keep all other existing logic unchanged
  
  const { view } = useCalendarState()
  const { openEventModal, setSelectedSlot } = useCalendarActions()
  
  // All existing handler logic stays the same
  // All existing BigCalendar configuration stays the same
  
  return (
    <DragAndDropCalendar
      events={events} // ← Use prop instead of store
      // ... rest of existing props
    />
  )
}
```

#### 4.3 Update CalendarToolbar Component

**File**: `src/components/calendar/components/CalendarToolbar.tsx` (add calendar selector)
```typescript
interface CalendarToolbarProps {
  calendars: Array<{
    id: string
    summary: string  
    primary?: boolean
  }>
}

export const CalendarToolbar = ({ calendars }: CalendarToolbarProps) => {
  const { view, selectedCalendarId } = useCalendarState()
  const { setView, setSelectedCalendar, navigateToNext, navigateToPrevious, navigateToToday } = useCalendarActions()
  
  return (
    <div className="calendar-toolbar">
      {/* Keep all existing navigation buttons */}
      
      {/* Add calendar selector */}
      <select 
        value={selectedCalendarId}
        onChange={(e) => setSelectedCalendar(e.target.value)}
        className="calendar-selector"
      >
        {calendars.map(calendar => (
          <option key={calendar.id} value={calendar.id}>
            {calendar.summary} {calendar.primary ? '(Primary)' : ''}
          </option>
        ))}
      </select>
      
      {/* Keep all existing view buttons */}
    </div>
  )
}
```

## 🎛️ SOLID Architecture Integration

### Single Responsibility Principle ✅
- **CalendarService**: Only handles API communication
- **TransformUtils**: Only handles data transformation  
- **CalendarStore**: Only handles UI state (events moved to TanStack Query)
- **Components**: Only handle presentation logic

### Open/Closed Principle ✅  
- **Extensible**: Easy to add more calendar providers
- **Closed for modification**: Existing components don't need changes
- **New transformers**: Can add more data transformation strategies

### Liskov Substitution ✅
- **CalendarEvent interface**: Any event source can implement this
- **API service**: Can be swapped for different calendar providers
- **Store hooks**: Work with any data source

### Interface Segregation ✅
- **Focused hooks**: `useCalendarEvents`, `useCalendarData`, `useCalendarState`
- **Specialized interfaces**: Each component gets only what it needs
- **Clean APIs**: TanStack Query provides focused data access

### Dependency Inversion ✅
- **Components depend on abstractions**: Hooks, not direct API calls
- **Store depends on abstractions**: TanStack Query, not axios directly  
- **Easy testing**: Can mock hooks and services independently

## 🚀 Benefits of This Integration Plan

### Immediate Benefits
1. **Zero Breaking Changes**: Existing components work unchanged
2. **Better Performance**: TanStack Query caching and background updates
3. **Real Data**: Connected to actual Google Calendar
4. **Error Handling**: Built-in retry and error states
5. **Loading States**: Proper loading indicators

### Long-term Benefits  
1. **Scalability**: Easy to add more calendar providers
2. **Maintainability**: Clear separation of concerns
3. **Testability**: Each layer can be tested independently
4. **Offline Support**: TanStack Query provides offline capabilities
5. **Real-time**: Easy to add WebSocket updates later

## 📋 Implementation Checklist

### Day 1
- [ ] Set up TanStack Query in app layout
- [ ] Create `calendar.service.ts` with API functions and hooks
- [ ] Create `calendar-transform.utils.ts` with transformation functions
- [ ] Test API connections and data transformation

### Day 2  
- [ ] Update `calendarStore.ts` to remove events state
- [ ] Create new composite hooks (`useCalendarEvents`, `useCalendarData`)
- [ ] Update `Calendar.tsx` to use new hooks
- [ ] Update `CalendarGrid.tsx` to accept events prop

### Day 3
- [ ] Update `CalendarToolbar.tsx` to show calendar selector
- [ ] Add loading and error states to UI
- [ ] Test all calendar interactions (navigation, modal, etc.)
- [ ] Handle edge cases (no events, calendar access errors)

### Testing & Polish
- [ ] Test with different timezones
- [ ] Test error scenarios (network failure, auth errors)
- [ ] Verify performance with large event sets
- [ ] Update any remaining sample data references

## 🔧 Configuration Notes

### TanStack Query Settings
```typescript
{
  staleTime: 2 * 60 * 1000,    // Events: 2 minutes
  gcTime: 5 * 60 * 1000,       // Cache: 5 minutes  
  retry: 3,                    // Retry failed requests
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
}
```

### Error Handling Strategy
1. **Network Errors**: Retry automatically
2. **Auth Errors (401)**: Don't retry, show login prompt  
3. **Permission Errors (403)**: Show access denied message
4. **Rate Limits (429)**: Exponential backoff retry

### Performance Optimizations
1. **Query Keys**: Structured for efficient invalidation
2. **Background Refetch**: Keep data fresh automatically
3. **Selective Updates**: Only refetch when date range changes
4. **Memory Management**: Automatic garbage collection of unused data

## 🎉 Final Result

After integration, you'll have:
- ✅ Real Google Calendar data instead of sample data
- ✅ Automatic background syncing and caching
- ✅ Proper loading and error states
- ✅ Multiple calendar support
- ✅ All existing UI interactions working perfectly
- ✅ SOLID architecture principles maintained
- ✅ Easy to extend with more calendar providers

Your existing calendar UI is already excellent - this plan just connects it to real data while maintaining all current functionality and user experience.