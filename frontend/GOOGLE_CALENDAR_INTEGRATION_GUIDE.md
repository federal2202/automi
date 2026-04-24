# Google Calendar Integration Guide

This guide documents the complete Google Calendar integration implementation for NotebookLM, providing a blueprint for future API integrations.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Implementation](#frontend-implementation)
3. [Backend Implementation](#backend-implementation)
4. [Integration Steps](#integration-steps)
5. [API Endpoints](#api-endpoints)
6. [Error Handling](#error-handling)
7. [Testing Guide](#testing-guide)
8. [Recent Bug Fixes](#-recent-bug-fixes)
9. [Future Enhancements](#future-enhancements)

## 🏗️ Architecture Overview

### Data Flow
```
Google Calendar API → Backend Express Server → Frontend React App → User Interface
                                ↓                     ↓
                            TanStack Query ← Zustand Store ← Components
```

### Key Design Principles
- **Separation of Concerns**: UI state (Zustand) + Data fetching (TanStack Query)
- **Graceful Fallbacks**: Sample data when Google Calendar unavailable
- **Type Safety**: Full TypeScript coverage
- **Error Handling**: Comprehensive error states with user feedback
- **Performance**: Intelligent caching and background updates

## 🎨 Frontend Implementation

### 1. Dependencies Setup

**Required packages:**
```json
{
  "@tanstack/react-query": "^5.100.1",
  "@tanstack/react-query-devtools": "^5.100.0",
  "axios": "^1.15.1",
  "zustand": "^5.0.12"
}
```

**Installation:**
```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools axios zustand
```

### 2. Project Structure

```
src/
├── api/
│   └── axios.ts                    # Axios instance configuration
├── components/
│   └── providers/
│       └── QueryProvider.tsx      # TanStack Query setup
├── hooks/
│   └── calendar/
│       ├── useGoogleCalendar.ts    # Google Calendar TanStack Query hooks
│       └── useCalendarWithGoogle.ts # Combined calendar hook
├── services/
│   └── calendar.service.ts         # API service functions
├── stores/
│   └── calendarStore.ts           # Zustand UI state store
├── types/
│   ├── calendar/
│   │   └── calendar.types.ts      # Internal calendar types
│   └── google-calendar.types.ts   # Google Calendar API types
└── utils/
    └── calendar/
        └── calendar-transform.utils.ts # Data transformation utilities
```

### 3. Core Components

#### A. Axios Configuration (`src/api/axios.ts`)
```typescript
import axios from 'axios';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true  // Important for auth cookies
})
```

#### B. TanStack Query Provider (`src/components/providers/QueryProvider.tsx`)
```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,    // 5 minutes
        gcTime: 10 * 60 * 1000,     // 10 minutes cache
        retry: (failureCount, error: any) => {
          // Don't retry auth errors
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            return false
          }
          return failureCount < 2
        }
      }
    }
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
```

#### C. Calendar Service (`src/services/calendar.service.ts`)
```typescript
import { api } from '@/api/axios'
import { GoogleCalendarListItem, GoogleCalendarItem } from '@/types/google-calendar.types'

// API Functions
export const getCalendars = async (): Promise<readonly GoogleCalendarListItem[]> => {
  try {
    const response = await api.get('/calendar/calendars')
    return response.data.items
  } catch (error) {
    throw handleCalendarServiceError(error)
  }
}

export const getEvents = async (params: EventsQueryParams): Promise<readonly GoogleCalendarItem[]> => {
  try {
    const response = await api.get('/calendar/events', { params })
    return response.data.items
  } catch (error) {
    throw handleCalendarServiceError(error)
  }
}

// Error handling function
const handleCalendarServiceError = (error: unknown) => {
  // Transform errors into standardized format
  if (error?.response?.status === 401) {
    return {
      type: 'AUTH_ERROR',
      message: 'Authentication required. Please sign in to access your calendar.'
    }
  }
  // ... other error cases
}
```

#### D. TanStack Query Hooks (`src/hooks/calendar/useGoogleCalendar.ts`)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { calendarService } from '@/services/calendar.service'

// Query key factory
export const googleCalendarQueryKeys = {
  all: ['google-calendar'] as const,
  calendars: () => [...googleCalendarQueryKeys.all, 'calendars'] as const,
  events: (params: EventsQueryParams) => [...googleCalendarQueryKeys.all, 'events', params] as const
}

// Calendar list hook
export const useGoogleCalendars = () => {
  return useQuery({
    queryKey: googleCalendarQueryKeys.calendars(),
    queryFn: calendarService.getCalendars,
    staleTime: 5 * 60 * 1000,  // 5 minutes
    retry: 2
  })
}

// Events hook with transformation
export const useGoogleCalendarEvents = (params: EventsQueryParams) => {
  return useQuery({
    queryKey: googleCalendarQueryKeys.events(params),
    queryFn: async () => {
      const googleEvents = await calendarService.getEvents(params)
      return transformGoogleEventsArray(googleEvents)  // Transform to internal format
    },
    enabled: !!params.calendarId,
    staleTime: 2 * 60 * 1000  // 2 minutes
  })
}

// Mutation hooks for CRUD operations
export const useCreateGoogleCalendarEvent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ calendarId, event }) => {
      const googleEventData = transformCalendarEventToGoogle(event)
      return calendarService.createEvent(calendarId, googleEventData)
    },
    onSuccess: () => {
      // Invalidate and refetch calendar data
      queryClient.invalidateQueries({ queryKey: googleCalendarQueryKeys.all })
    }
  })
}
```

#### E. Zustand Store (`src/stores/calendarStore.ts`)

The Zustand store is **UI-only** for raw state (currentDate, view, modal open/close, `selectedEventId`, `selectedCalendarId`, `error`). However, it *also* exposes thin CRUD wrapper hooks (`createEvent`, `updateEvent`, `deleteEvent`, `moveEvent`) via `useEventManagement`. These wrappers do not hold data themselves — they internally call the TanStack Query mutation hooks (`useCreateGoogleCalendarEvent`, `useUpdateGoogleCalendarEvent`, `useDeleteGoogleCalendarEvent`) from `@/hooks/calendar/useGoogleCalendar` and funnel the store's `selectedCalendarId` into them. The currently `selectedEvent` is **not** stored — it is resolved on demand by scanning the TanStack Query cache via `queryClient.getQueriesData(googleCalendarQueryKeys.events())` for the event matching `selectedEventId` (skipping the raw-variant caches whose keys end in `'raw'`).

```typescript
import { create } from 'zustand'
import { useQueryClient } from '@tanstack/react-query'
import {
  useCreateGoogleCalendarEvent,
  useUpdateGoogleCalendarEvent,
  useDeleteGoogleCalendarEvent,
  googleCalendarQueryKeys,
} from '@/hooks/calendar/useGoogleCalendar'

// UI-only state (data handled by TanStack Query)
interface CalendarStore {
  currentDate: Date
  view: CalendarView
  isEventModalOpen: boolean
  selectedEventId: string | null
  selectedCalendarId: string
  error: string | null

  setCurrentDate: (date: Date) => void
  setView: (view: CalendarView) => void
  openEventModal: (eventId?: string) => void
  closeEventModal: () => void
  setError: (error: string | null) => void
}

export const useCalendarStore = create<CalendarStore>((set) => ({
  currentDate: new Date(),
  view: 'week',
  isEventModalOpen: false,
  selectedEventId: null,
  selectedCalendarId: 'primary',
  error: null,
  setCurrentDate: (date) => set({ currentDate: date }),
  setView: (view) => set({ view }),
  openEventModal: (eventId) => set({ isEventModalOpen: true, selectedEventId: eventId ?? null }),
  closeEventModal: () => set({ isEventModalOpen: false, selectedEventId: null }),
  setError: (error) => set({ error }),
}))

// CRUD wrapper hook — thin bridge to TanStack Query mutations
export function useEventManagement() {
  const queryClient = useQueryClient()
  const { selectedEventId, selectedCalendarId, closeEventModal, setError } = useCalendarStore()
  const createMutation = useCreateGoogleCalendarEvent()
  const updateMutation = useUpdateGoogleCalendarEvent()
  const deleteMutation = useDeleteGoogleCalendarEvent()

  // selectedEvent is derived from the TanStack Query cache, not stored
  const selectedEvent = (() => {
    if (!selectedEventId) return null
    const caches = queryClient.getQueriesData({ queryKey: googleCalendarQueryKeys.events() })
    for (const [key, data] of caches) {
      if ((key as readonly unknown[]).at(-1) === 'raw') continue
      const match = (data as CalendarEvent[] | undefined)?.find((e) => e.id === selectedEventId)
      if (match) return match
    }
    return null
  })()

  const createEvent = async (event: Partial<CalendarEvent>) => {
    try {
      await createMutation.mutateAsync({ calendarId: selectedCalendarId, event })
      closeEventModal()
    } catch (e) { setError((e as Error).message) }
  }
  // updateEvent / deleteEvent / moveEvent follow the same pattern

  const isLoading =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  return { selectedEvent, createEvent, /* updateEvent, deleteEvent, moveEvent, */ isLoading }
}
```

#### F. Combined Hook (`src/hooks/calendar/useCalendarWithGoogle.ts`)
```typescript
export function useCalendarWithGoogle() {
  const { currentDate, view, selectedCalendarId } = useCalendarState()
  
  // Generate sample events as fallback
  const sampleEvents = useEventGeneration()
  
  // Fetch Google Calendar data
  const { data: googleEvents = [], isLoading, error } = useGoogleCalendarEvents({
    calendarId: selectedCalendarId,
    timeMin: startDate.toISOString(),
    timeMax: endDate.toISOString()
  })
  
  // Smart fallback: use Google data if available, otherwise sample data
  const events = useMemo(() => {
    return googleEvents.length > 0 && !error ? googleEvents : sampleEvents
  }, [googleEvents, error, sampleEvents])
  
  return {
    events,
    isLoading,
    error,
    isUsingGoogleCalendar: googleEvents.length > 0 && !error,
    refetch
  }
}
```

## 🖥️ Backend Implementation

### 1. Dependencies Setup

**Required packages:**
```json
{
  "googleapis": "^latest",
  "express": "^latest",
  "cors": "^latest"
}
```

### 2. Calendar Routes (`src/routes/calendar.ts`)

```typescript
import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { createCalendarClient } from '../utils/googleAuth';

const router = express.Router();

router.use(authenticateToken);  // Ensure user is authenticated

// GET /calendar/calendars - List user's calendars
router.get('/calendars', async (req: AuthRequest, res) => {
  try {
    const calendar = await createCalendarClient(req.user!);
    const calendars = await calendar.calendarList.list();
    res.json(calendars.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch calendars' });
  }
});

// GET /calendar/events - Get calendar events
router.get('/events', async (req: AuthRequest, res) => {
  const { calendarId = 'primary', timeMin, timeMax } = req.query;
  
  try {
    const calendar = await createCalendarClient(req.user!);
    const events = await calendar.events.list({
      calendarId: calendarId as string,
      timeMin: timeMin as string,
      timeMax: timeMax as string,
      singleEvents: true,
      orderBy: 'startTime'
    });
    res.json(events.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// POST /calendar/events - Create new event
router.post('/events', async (req: AuthRequest, res) => {
  const { calendarId = 'primary', ...eventData } = req.body;
  
  try {
    const calendar = await createCalendarClient(req.user!);
    const event = await calendar.events.insert({
      calendarId: calendarId as string,
      requestBody: eventData
    });
    res.status(201).json(event.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /calendar/events/:eventId - Update event
router.put('/events/:eventId', async (req: AuthRequest, res) => {
  const { eventId } = req.params;
  const { calendarId = 'primary', ...eventData } = req.body;
  
  try {
    const calendar = await createCalendarClient(req.user!);
    const event = await calendar.events.update({
      calendarId: calendarId as string,
      eventId: eventId,
      requestBody: eventData
    } as any);
    res.json(event.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /calendar/events/:eventId - Delete event
router.delete('/events/:eventId', async (req: AuthRequest, res) => {
  const { eventId } = req.params;
  const { calendarId = 'primary' } = req.query;
  
  try {
    const calendar = await createCalendarClient(req.user!);
    await calendar.events.delete({
      calendarId: calendarId as string,
      eventId: eventId
    } as any);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;
```

### 3. Express App Setup (`src/index.ts`)

```typescript
import express from 'express';
import cors from 'cors';
import calendarRoutes from './routes/calendar';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true  // Important for auth cookies
}));

app.use(express.json());
app.use(cookieParser());

// Mount calendar routes
app.use('/calendar', calendarRoutes);

app.listen(8000);
```

## 🔄 Integration Steps

### Step 1: Setup TanStack Query
1. Install dependencies
2. Create QueryProvider component
3. Wrap app in QueryProvider

### Step 2: Create API Service Layer
1. Setup axios instance with credentials
2. Create service functions for each API endpoint
3. Implement error handling

### Step 3: Create TanStack Query Hooks
1. Define query key factory
2. Create hooks for each operation
3. Add proper TypeScript types

### Step 4: Update Zustand Store
1. Remove data state (handled by TanStack Query)
2. Keep only UI state
3. Create focused hooks for different concerns

### Step 5: Create Combined Hook
1. Combine TanStack Query data with Zustand UI state
2. Implement fallback logic
3. Handle loading and error states

### Step 6: Update Components
1. Replace old hooks with new combined hook
2. Handle loading and error states in UI
3. Show connection status to users

### Step 7: Add Backend Endpoints
1. Create calendar routes with authentication
2. Implement CRUD operations
3. Add proper error handling and logging

### Step 8: Sync Frontend/Backend APIs
1. Ensure API paths match exactly
2. Verify parameter passing
3. Test all CRUD operations

## 📡 API Endpoints

### Frontend → Backend
| Method | Frontend Call | Backend Route | Purpose |
|--------|---------------|---------------|---------|
| GET | `/calendar/calendars` | `GET /calendars` | List user's calendars |
| GET | `/calendar/events?calendarId=X&timeMin=Y&timeMax=Z` | `GET /events` | Get calendar events |
| POST | `/calendar/events` | `POST /events` | Create new event |
| PUT | `/calendar/events/:id` | `PUT /events/:eventId` | Update existing event |
| DELETE | `/calendar/events/:id` | `DELETE /events/:eventId` | Delete event |

### Backend → Google Calendar API
| Backend Method | Google API Call | Purpose |
|----------------|------------------|---------|
| `calendar.calendarList.list()` | GET calendars | List user's calendars |
| `calendar.events.list()` | GET events | Get events from calendar |
| `calendar.events.insert()` | POST events | Create new event |
| `calendar.events.update()` | PUT events | Update existing event |
| `calendar.events.delete()` | DELETE events | Delete event |

## ⚠️ Error Handling

### Frontend Error States
```typescript
// Service layer error transformation
const handleCalendarServiceError = (error: unknown): CalendarServiceError => {
  if (error?.response?.status === 401) {
    return {
      type: 'AUTH_ERROR',
      message: 'Authentication required. Please sign in to access your calendar.'
    }
  }
  // ... other error cases
}

// Component error handling
if (error && !isUsingGoogleCalendar) {
  return (
    <div className="error-fallback">
      <p>Unable to connect to Google Calendar. Showing sample data.</p>
      <button onClick={() => refetch()}>Retry</button>
    </div>
  )
}
```

### Backend Error Handling
```typescript
try {
  const calendar = await createCalendarClient(req.user!);
  const events = await calendar.events.list(params);
  res.json(events.data);
} catch (error) {
  Logger.error('Events fetch error', { userId: req.user!.id, error });
  res.status(500).json({ error: 'Failed to fetch events' });
}
```

## 🧪 Testing Guide

### 1. Test Authentication Flow
```bash
# 1. Start backend
cd backend && npm run dev

# 2. Navigate to auth endpoint
curl http://localhost:8000/auth/google

# 3. Complete OAuth flow
# 4. Verify cookies are set
```

### 2. Test API Endpoints
```bash
# Test calendar list (with auth cookies)
curl -X GET http://localhost:8000/calendar/calendars \
  -H "Cookie: your-auth-cookies"

# Test events list
curl -X GET "http://localhost:8000/calendar/events?calendarId=primary&timeMin=2024-01-01T00:00:00Z" \
  -H "Cookie: your-auth-cookies"
```

### 3. Test Frontend Integration
```bash
# 1. Start frontend
cd frontend && pnpm dev

# 2. Navigate to calendar page
# 3. Check browser network tab for API calls
# 4. Verify fallback to sample data when API fails
# 5. Test TanStack Query DevTools
```

### 4. Test Error Scenarios
- Network disconnection
- Invalid authentication
- Google API rate limits
- Malformed data

## 🐛 Recent Bug Fixes

This section documents bug fixes applied to the Google Calendar integration so future developers/agents can understand the current state of the code.

### Bug 1 — Create Event modal button did not send an API request
The Create button in `EventForm` had no effect. The root cause was in `src/stores/calendarStore.ts`: the `useEventManagement` hook exposed `createEvent`, `updateEvent`, `deleteEvent`, and `moveEvent` as placeholder no-ops that only called `console.warn`. They were never wired to real mutations.

### Bug 2 — Edit Event modal showed the wrong times; Update/Delete did not work
Opening an existing event showed the *current* time instead of the event's actual start/end, and Update/Delete buttons were no-ops. Root cause: `useEventManagement` hardcoded `selectedEvent: null`. That meant `EventForm` received `initialData={undefined}` and fell back to create-mode defaults built from `new Date()`. The mutation wrappers were also no-ops (see Bug 1), so Update/Delete could not fire.

### Fix (single file: `src/stores/calendarStore.ts`)
- Imported `useQueryClient` from `@tanstack/react-query`, the mutation hooks `useCreateGoogleCalendarEvent` / `useUpdateGoogleCalendarEvent` / `useDeleteGoogleCalendarEvent`, and `googleCalendarQueryKeys` from `@/hooks/calendar/useGoogleCalendar`.
- Wired `createEvent` / `updateEvent` / `deleteEvent` / `moveEvent` to call the corresponding `mutateAsync` with the store's `selectedCalendarId`. They close the modal on success and route errors through `setError`.
- `selectedEvent` is now resolved on demand by scanning the TanStack Query cache: `queryClient.getQueriesData(googleCalendarQueryKeys.events())`. Raw-variant caches (keys ending in `'raw'`) are skipped, and the transformed event whose `id` matches `selectedEventId` is returned.
- `isLoading` now also reflects any mutation's `isPending` (not just query-loading state).

### Known Issues

**Partial updates can overwrite fields.** `useUpdateGoogleCalendarEvent` (in `src/hooks/calendar/useGoogleCalendar.ts`) builds a full Google event payload from `Partial<CalendarEvent>` using fallbacks like `title || 'Updated Event'` and `start || new Date()`. Because the Google Calendar PUT replaces the whole event, this works fine for full-form edits (since `EventForm` sends every field) but is lossy for `moveEvent` drag/resize, which only passes `start` / `end` — the event's `title` would be overwritten with the literal string `'Updated Event'`. **Recommended future fix:** switch to PATCH, or fetch-then-merge the existing event before PUTing, so partial updates preserve untouched fields.

## 🚀 Future Enhancements

### Performance Optimizations
1. **Query Optimization**
   ```typescript
   // Prefetch next month's events
   queryClient.prefetchQuery({
     queryKey: googleCalendarQueryKeys.events(nextMonthParams),
     queryFn: () => calendarService.getEvents(nextMonthParams)
   })
   ```

2. **Background Sync**
   ```typescript
   // Auto-refresh every 5 minutes
   useQuery({
     queryKey: googleCalendarQueryKeys.events(params),
     queryFn: () => calendarService.getEvents(params),
     refetchInterval: 5 * 60 * 1000
   })
   ```

### Additional Features
1. **Real-time Updates**: WebSocket integration for live calendar changes
2. **Offline Support**: Cache events locally with service worker
3. **Multi-calendar Support**: Sync multiple Google Calendar accounts
4. **Advanced Filtering**: Filter events by type, attendees, etc.
5. **Recurring Events**: Better handling of recurring event patterns

### Monitoring & Analytics
1. **Error Tracking**: Implement Sentry for error monitoring
2. **Performance Metrics**: Add performance tracking
3. **Usage Analytics**: Track feature usage patterns

## 🔗 Key Takeaways

1. **Separation of Concerns**: UI state (Zustand) separate from data fetching (TanStack Query)
2. **Graceful Degradation**: Always provide fallbacks when external APIs fail
3. **Type Safety**: Comprehensive TypeScript coverage prevents runtime errors
4. **Error Boundaries**: Handle errors at multiple levels (service, hook, component)
5. **Caching Strategy**: Smart caching reduces API calls and improves performance
6. **Authentication**: Secure cookie-based auth with proper CORS configuration
7. **API Design**: RESTful endpoints with consistent error responses
8. **Testing Strategy**: Test authentication, API endpoints, and error scenarios

This integration pattern can be applied to any external API integration, not just Google Calendar!