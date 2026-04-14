# How the Calendar Component Works with React-Big-Calendar

## Architecture Overview

Your calendar is built on top of the `react-big-calendar` library with complete UI customization. The component represents a complex system with custom design, state management, and backend integration capabilities.

## Data Structure

### Event Interface (CalendarEvent)
```typescript
interface CalendarEvent {
  id: string                    // Unique identifier
  title: string                 // Event title
  start: Date                   // Start time
  end: Date                     // End time
  type: 'primary' | 'secondary' | 'critical' | 'inactive'  // Type for styling
  description?: string          // Optional description
}
```

### Event Types and Styling
- **Primary** - Main events (green theme)
- **Secondary** - Secondary events (purple theme) 
- **Critical** - Critical events (highlighted green with border)
- **Inactive** - Inactive events (gray, semi-transparent)

## Current Implementation (Mock Data)

### Sample Event Generation
```typescript
const generateSampleEvents = (): CalendarEvent[] => {
  const now = moment()
  const currentWeekStart = now.clone().startOf('week')
  
  return [
    // Events are generated for the current week using moment.js
    // Each event is tied to specific days and times
  ]
}
```

**Key Features:**
- Events are dynamically generated for the current week
- Uses timezone-aware approach with moment.js
- Includes various event types for demonstration

## Backend Integration

### 1. API Endpoints Structure

```typescript
// Recommended API endpoints for integration
interface CalendarAPI {
  // Fetch events
  GET '/api/events' 
    // Query params: start_date, end_date, user_id
    // Response: CalendarEvent[]
  
  // Create event
  POST '/api/events'
    // Body: Omit<CalendarEvent, 'id'>
    // Response: CalendarEvent
  
  // Update event
  PUT '/api/events/:id'
    // Body: Partial<CalendarEvent>
    // Response: CalendarEvent
  
  // Delete event
  DELETE '/api/events/:id'
    // Response: { success: boolean }
  
  // Move event (drag & drop)
  PATCH '/api/events/:id/move'
    // Body: { start: Date, end: Date }
    // Response: CalendarEvent
}
```

### 2. Zustand Store for State Management

```typescript
// /src/stores/calendarStore.ts
interface CalendarStore {
  events: CalendarEvent[]
  loading: boolean
  error: string | null
  
  // Actions
  fetchEvents: (startDate: Date, endDate: Date) => Promise<void>
  createEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  moveEvent: (id: string, start: Date, end: Date) => Promise<void>
}
```

### 3. Custom Hooks for API Integration

```typescript
// /src/hooks/useCalendarEvents.ts
const useCalendarEvents = (currentDate: Date, view: View) => {
  const { events, loading, error, fetchEvents } = useCalendarStore()
  
  useEffect(() => {
    const { startDate, endDate } = getDateRange(currentDate, view)
    fetchEvents(startDate, endDate)
  }, [currentDate, view])
  
  return { events, loading, error }
}

// /src/hooks/useCalendarMutations.ts  
const useCalendarMutations = () => {
  const { createEvent, updateEvent, deleteEvent, moveEvent } = useCalendarStore()
  
  return {
    createEvent: useMutation(createEvent),
    updateEvent: useMutation(updateEvent),
    deleteEvent: useMutation(deleteEvent),
    moveEvent: useMutation(moveEvent)
  }
}
```

## Updating Component for Backend Integration

### 1. Replace Mock Data with Real API

```typescript
export default function WeeklyCalendar({ className }: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<View>(Views.WORK_WEEK)
  
  // Replace this:
  // const sampleEvents = generateSampleEvents()
  
  // With this:
  const { events, loading, error } = useCalendarEvents(currentDate, view)
  const { createEvent, updateEvent, deleteEvent, moveEvent } = useCalendarMutations()
  
  // Event handlers
  const handleSelectSlot = async ({ start, end }: { start: Date, end: Date }) => {
    // Create new event when clicking on empty slot
    const newEvent = {
      title: 'New Event',
      start,
      end,
      type: 'primary' as const
    }
    await createEvent.mutateAsync(newEvent)
  }
  
  const handleSelectEvent = (event: CalendarEvent) => {
    // Handle event click (open edit modal)
    openEventModal(event)
  }
  
  const handleEventDrop = async ({ event, start, end }: any) => {
    // Handle drag & drop event
    await moveEvent.mutateAsync(event.id, start, end)
  }
  
  const handleEventResize = async ({ event, start, end }: any) => {
    // Handle event resize
    await moveEvent.mutateAsync(event.id, start, end)
  }
}
```

### 2. Adding Interactivity

```typescript
<BigCalendar
  // ... existing props
  events={events} // Replace sampleEvents with events from API
  
  // Add event handlers:
  onSelectSlot={handleSelectSlot}
  onSelectEvent={handleSelectEvent}
  onEventDrop={handleEventDrop}
  onEventResize={handleEventResize}
  
  // Enable drag & drop
  draggableAccessor={() => true}
  resizable
  
  // Loading state
  style={{
    ...existingStyle,
    opacity: loading ? 0.7 : 1
  }}
/>

{/* Add loading indicator */}
{loading && (
  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
  </div>
)}

{/* Error handling */}
{error && (
  <div className="absolute top-4 right-4 bg-red-500 text-white p-4 rounded">
    Error: {error}
  </div>
)}
```

## Advanced Backend Features

### 1. Real-time Updates (WebSocket)

```typescript
// /src/hooks/useCalendarRealtime.ts
const useCalendarRealtime = () => {
  const { events, setEvents } = useCalendarStore()
  
  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL)
    
    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data)
      
      switch (type) {
        case 'EVENT_CREATED':
          setEvents([...events, data])
          break
        case 'EVENT_UPDATED':
          setEvents(events.map(e => e.id === data.id ? data : e))
          break
        case 'EVENT_DELETED':
          setEvents(events.filter(e => e.id !== data.id))
          break
      }
    }
    
    return () => ws.close()
  }, [events])
}
```

### 2. Caching with React Query

```typescript
// /src/hooks/useCalendarQuery.ts
const useCalendarEvents = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ['calendar-events', startDate, endDate],
    queryFn: () => fetchEvents(startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000  // 10 minutes
  })
}
```

### 3. Optimistic Updates

```typescript
const useOptimisticUpdates = () => {
  const queryClient = useQueryClient()
  
  const updateEventOptimistic = useMutation({
    mutationFn: updateEvent,
    onMutate: async (variables) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries(['calendar-events'])
      
      // Save previous state
      const previousEvents = queryClient.getQueryData(['calendar-events'])
      
      // Optimistically update UI
      queryClient.setQueryData(['calendar-events'], old => 
        old.map(event => 
          event.id === variables.id 
            ? { ...event, ...variables.updates }
            : event
        )
      )
      
      return { previousEvents }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['calendar-events'], context.previousEvents)
    }
  })
}
```

## Architecture Recommendations

### 1. File Structure
```
src/
├── components/
│   ├── ui/
│   │   └── calendar.tsx              # Main component
│   └── calendar/
│       ├── EventModal.tsx           # Create/edit modal
│       ├── EventCard.tsx           # Event component
│       └── CalendarFilters.tsx     # Event filters
├── hooks/
│   ├── useCalendarEvents.ts        # Hook for fetching events
│   ├── useCalendarMutations.ts     # Hook for mutations
│   └── useCalendarRealtime.ts      # Real-time updates
├── stores/
│   └── calendarStore.ts            # Zustand store
├── api/
│   └── calendar.ts                 # API methods
└── types/
    └── calendar.ts                 # TypeScript types
```

### 2. Performance Optimization
- Use `React.memo` for CustomEvent component
- Virtualization for large numbers of events
- Debouncing for search and filtering
- Lazy loading for historical data

### 3. Security
- Date validation on both client and server
- User input sanitization
- Rate limiting for API requests
- Authorization for user actions

## Current Component Features

### Custom Components
- **CustomEvent**: Renders events with different styling based on type
- **CustomToolbar**: Custom navigation and view controls
- **CustomDayHeader**: Custom day headers with today highlighting

### Styling System
- Dark theme focused design
- CSS-in-JS with Tailwind classes
- Responsive design for mobile/desktop
- Custom animations and transitions

### View Types Supported
- **Day View**: Single day with detailed time slots
- **Work Week**: Monday-Friday week view  
- **Month View**: Full month with dot indicators for events

This calendar is ready for backend integration thanks to its flexible architecture and well-defined data interfaces. The current mock implementation can be easily replaced with real API calls while maintaining all the custom styling and functionality.