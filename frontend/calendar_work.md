# Calendar Component Development & Refactoring Guide

## Current Status: REFACTORING IN PROGRESS

**Priority: CRITICAL** - The current monolithic calendar component (460+ lines) needs complete refactoring before adding new functionality.

### ✅ Completed Tasks
- [x] Fixed week view to show all 7 days (including weekends)
- [x] Fixed hidden date headers issue (CSS was hiding them)
- [x] Simplified header styling (white text, green for today only)
- [x] Removed fancy borders and styling from headers
- [x] Created comprehensive refactoring plan with planner agent
- [x] Conducted code review identifying critical issues
- [x] **Phase 1 Complete: Setup Foundation**
  - [x] Created modular folder structure (`src/components/calendar/`)
  - [x] Extracted TypeScript type definitions (`calendar.types.ts`)
  - [x] Created style constants preserving exact design values (`calendarStyles.ts`)
  - [x] Extracted date utilities and formatting functions (`dateUtils.ts`)
  - [x] Built Zustand store for calendar state management (`useCalendarState.ts`)
  - [x] Extracted sample event generation logic (`useEventGeneration.ts`)
  - [x] Created BigCalendar configuration utilities (`calendarFormats.ts`)
  - [x] Set up main export index file

### 🚧 Current Refactoring Plan

**Priority Order (DESIGN-SAFE APPROACH):**
1. **Phase 1: Setup Foundation** - Types, utils, store (NEXT)
   - Create style constants to preserve exact colors/spacing
   - Extract utilities without changing component structure
   - Set up Zustand store alongside existing state

2. **Phase 2: Extract Components** - EventCard, DayHeader, Toolbar  
   - Copy exact styling from inline components
   - Add React.memo for performance
   - Test visual output after each extraction

3. **Phase 3: Main Calendar Refactor** - CalendarGrid, CalendarProvider
   - Maintain BigCalendar integration exactly as-is
   - Preserve all CSS class names and responsive behavior

4. **Phase 4: Data Layer** - Event management, Zustand integration
   - Keep sample data generation working identically
   - Gradual migration of state management

5. **Phase 5: Visual Regression Testing** - Verify zero changes
   - Screenshot comparison before/after
   - Responsive behavior testing on all breakpoints
   - All view modes (day/week/month) verification

## 🔍 Code Review Findings (Quality Score: 3/10)

### Critical Issues Identified:
- **Monolithic Architecture**: 460+ lines violate Single Responsibility Principle
- **Hard-coded Data Generation**: Sample events mixed with UI logic
- **Performance Anti-patterns**: Inline functions, no memoization
- **Type Safety Issues**: Missing error handling, unsafe casting
- **Design System Violations**: Hard-coded colors, inconsistent patterns

## Event Styling Refactoring Plan (APPROVED)

### 🎯 New Requirements for Event Styling:
- **Remove time display** from events (cleaner look)
- **Use `rounded-sm`** instead of `rounded-2xl` (less rounded)
- **Remove left borders** (`border-l-4`) - make events "pure" rectangular
- **Simplified color scheme**: Green, Red, Purple, White (all with opacity)
- **Smaller events**: Reduce padding and font sizes
- **Full responsive design** for mobile devices

### 📋 Implementation Tasks:
1. **CalendarEvent.tsx Changes**:
   - Remove time display (`{formatTime(event.start)} - {formatTime(event.end)}`)
   - Change `rounded-2xl` → `rounded-sm`
   - Remove `border-l-4` from all event types
   - Reduce padding from `p-4` → `p-2`
   - Reduce font sizes: title `text-sm` → `text-xs`, description smaller

2. **Color Scheme Simplification**:
   ```css
   /* New simplified event colors */
   - Green: bg-green-500/10 text-green-400
   - Red: bg-red-500/10 text-red-400  
   - Purple: bg-purple-500/10 text-purple-400
   - White: bg-white/10 text-white
   ```

3. **Responsive Improvements**:
   - Add better mobile breakpoints in calendar.css
   - Ensure events remain readable on narrow screens
   - Test on mobile devices for optimal UX

### 🎨 Before vs After:
**BEFORE**: Large rounded events with time, left borders, complex colors
**AFTER**: Compact rectangular events, no time, clean colors, mobile-optimized

## New Proposed Architecture

**BEFORE:** Monolithic component with everything in one 460-line file
**AFTER:** Modular architecture with separated concerns

### Target File Structure:
```
src/components/calendar/
├── index.ts                    # Main export
├── Calendar.tsx               # Main container
├── hooks/
│   ├── useCalendarState.ts    # Zustand store
│   └── useEventGeneration.ts  # Sample data logic
├── components/
│   ├── CalendarToolbar.tsx    # Navigation & view controls
│   ├── CalendarGrid.tsx       # BigCalendar wrapper
│   ├── EventCard.tsx          # Event rendering
│   ├── DayHeader.tsx          # Day/date headers
│   └── FloatingChatButton.tsx # Chat button
├── utils/
│   ├── dateUtils.ts           # Date manipulation
│   ├── eventStyles.ts         # Styling logic
│   └── calendarFormats.ts     # BigCalendar configs
└── types/
    └── calendar.types.ts       # TypeScript definitions
```

## ⚠️ DESIGN PRESERVATION REQUIREMENTS

**CRITICAL:** All visual design and responsive behavior must remain EXACTLY the same during refactoring.

### 🎨 Design Patterns to Preserve

**1. Color System (DO NOT CHANGE):**
```css
/* Primary green variations */
--primary-green: #059669
--primary-green-dark: #065f46  
--primary-green-light: #10b981
--primary-green-bg: rgba(6,78,59,0.1)
--secondary-purple: #ddb7ff
--critical-green: #a7f3d0
--inactive-gray: #6b7280
```

**2. Event Type Styling (PRESERVE EXACTLY):**
- **Primary**: `bg-[rgba(6,78,59,0.1)] border-l-4 border-[#065f46] text-[#059669]`
- **Secondary**: `bg-[rgba(111,0,190,0.1)] border-l-4 border-[#ddb7ff] text-[#ddb7ff]`
- **Critical**: `bg-[rgba(6,78,59,0.6)] border border-[rgba(6,95,70,0.3)] text-[#a7f3d0]`
- **Inactive**: `bg-[#1c1b1b] border border-[rgba(59,75,53,0.15)] text-[#6b7280] opacity-60`

**3. Typography Hierarchy:**
- **Manifest Title**: 48px Space Grotesk, bold, tracking-[-2.4px]
- **Event Title**: 14px Plus Jakarta Sans, bold
- **Event Time**: 10px Plus Jakarta Sans, bold, uppercase  
- **Day Header**: 20px Space Grotesk, bold

### 📱 Responsive Breakpoints (MAINTAIN EXACTLY)

**Mobile (≤640px):**
- Time gutter: 80px → 50px
- Event padding: 4px → 6px  
- Font sizes: 14px → 11px
- Hide floating chat button
- Border radius: rounded-2xl → rounded-lg

**Tablet (≤768px):**
- Time gutter: 80px → 60px
- Event padding: 4px → 8px
- Font sizes: 14px → 12px
- Month cell height: 100px → 60px

**Layout Adaptations:**
- Toolbar: `flex-col lg:flex-row` for title/controls
- Controls: `flex-col sm:flex-row` for stacked mobile layout

### 🔧 Glassmorphism & Effects
- Navigation: `bg-[#0e0e0e] border border-[rgba(59,75,53,0.15)] rounded-full`
- Event cards: `border-l-4` with type-specific colors
- Today highlighting: `rgba(2,44,34,0.08)` background + `2px solid rgba(5,150,105,0.3)` border

## Benefits of Refactoring
- **Maintainability**: Smaller, focused components
- **Testability**: Isolated logic for unit testing
- **Reusability**: Components can be reused across features
- **Performance**: Proper memoization and optimization
- **Type Safety**: Complete TypeScript coverage
- **Extensibility**: Easy to add new features
- **Design Consistency**: Zero visual changes, same responsive behavior

## Original Data Structure (Preserved)

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