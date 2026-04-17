# NotebookLM Project State Documentation

**Generated**: 2026-04-17  
**Project Version**: Post-Calendar Implementation  
**Quality Status**: Production Ready with Interactive Calendar  

## Executive Summary

NotebookLM is a Next.js 16.2.2 application featuring both a landing page and a fully interactive dashboard with calendar functionality. The project has evolved from a basic MVP to a production-ready application with comprehensive event management capabilities.

### Current Status ✅
- **Interactive Calendar System**: Full CRUD operations with drag-and-drop functionality
- **Modern Tech Stack**: Next.js 16.2.2, React 19, TypeScript, Tailwind CSS 4
- **Production Architecture**: Modular components, Zustand state management, responsive design
- **Multiple Access Points**: Available on both `/dashboard` and `/calendar` routes

### Ready For
- ✅ **Frontend Development**: All UI components and interactions complete
- ✅ **Backend Integration**: Store architecture prepared for API connections
- ✅ **User Testing**: Fully functional calendar with proper error handling
- 🚧 **Production Deployment**: Requires backend API and authentication

## Technology Stack & Dependencies

### Core Framework
- **Next.js**: 16.2.2 with App Router (latest stable)
- **React**: 19.2.4 (latest major version)
- **TypeScript**: 5.x with strict configuration
- **Node.js**: Compatible with modern LTS versions

### UI & Styling
- **Tailwind CSS**: 4.x (latest major version)
- **shadcn/ui**: Radix-based components with consistent theming
- **CSS Variables**: Custom theming system with dark mode focus
- **Responsive Design**: Mobile-first with comprehensive breakpoints

### Calendar-Specific Dependencies
- **react-big-calendar**: 1.19.4 (main calendar engine)
- **react-dnd**: 16.0.1 (drag-and-drop functionality)
- **zustand**: 5.0.12 (state management)
- **moment.js**: 2.30.1 (date manipulation)
- **date-fns**: 4.1.0 (date formatting utilities)

### Development Tools
- **Package Manager**: PNPM (lockfile: pnpm-lock.yaml)
- **Linting**: ESLint with Next.js configuration
- **Type Checking**: TypeScript compiler with strict mode

## Project Architecture

### App Router Structure
```
src/app/
├── (landing)/              # Marketing pages with navbar/footer
│   ├── layout.tsx          # Landing-specific layout
│   ├── page.tsx           # Home page
│   └── about/             # About page
├── (dashboard)/            # Application dashboard
│   ├── layout.tsx          # Dashboard layout with sidebar
│   ├── dashboard/          # Main dashboard page
│   │   └── page.tsx       # Dashboard with calendar
│   └── calendar/          # Dedicated calendar page
│       └── page.tsx       # Same calendar functionality
└── layout.tsx             # Root layout (fonts, globals)
```

### Component Architecture
```
src/components/
├── ui/                     # shadcn/ui base components
│   ├── button.tsx          # Custom button variants
│   ├── calendar.tsx        # Original shadcn calendar (unused)
│   ├── dialog.tsx          # Modal dialogs
│   ├── input.tsx           # Form inputs
│   └── sidebar.tsx         # Dashboard sidebar
├── shared/                 # Reusable custom components
│   ├── Button.tsx          # Enhanced button component
│   ├── Footer.tsx          # Landing page footer
│   ├── Logo.tsx            # Brand logo component
│   └── Navigation.tsx      # Landing page navbar
├── landing/                # Landing page specific components
│   └── HeroSection.tsx     # Hero banner component
└── calendar/               # Complete calendar system
    ├── Calendar.tsx        # Main calendar container
    ├── components/         # Calendar sub-components
    ├── hooks/             # Calendar-specific hooks
    ├── types/             # TypeScript definitions
    ├── utils/             # Calendar utility functions
    └── index.ts           # Main exports
```

## Calendar System Architecture

### Component Hierarchy
```
Calendar.tsx (Main Container)
├── CalendarToolbar.tsx (Navigation & View Controls)
├── CalendarGrid.tsx (React Big Calendar Integration)
│   ├── CalendarEvent.tsx (Individual event rendering)
│   └── CalendarDayHeader.tsx (Day/date headers)
├── EventModal.tsx (Event Management Dialog)
│   └── EventForm.tsx (Event creation/editing form)
├── DeleteConfirmationDialog.tsx (Deletion workflow)
└── FloatingChatButton.tsx (UI enhancement)
```

### State Management (Zustand)
```typescript
// Central store: src/stores/calendarStore.ts
interface CalendarStore {
  // Calendar State
  currentDate: Date
  view: CalendarView
  events: CalendarEvent[]
  
  // UI State
  isEventModalOpen: boolean
  isCreateMode: boolean
  selectedEventId: string | null
  selectedSlot: { start: Date; end: Date } | null
  isLoading: boolean
  error: string | null
  
  // Actions (35+ methods)
  createEvent: (event) => Promise<void>
  updateEvent: (id, updates) => Promise<void>
  deleteEvent: (id) => Promise<void>
  moveEvent: (id, start, end) => Promise<void>
  // ... navigation, UI, and utility methods
}
```

### Event CRUD Operations
- **Create**: Click empty calendar slots → EventModal with EventForm
- **Read**: Events display with custom CalendarEvent components
- **Update**: Click existing events → EventModal pre-filled with data
- **Delete**: Delete button in edit form + confirmation dialog + keyboard shortcuts

### React Big Calendar Integration
```typescript
// CalendarGrid.tsx - Core integration
<DragAndDropCalendar
  localizer={momentLocalizer(moment)}
  events={events}
  view={view}
  selectable={true}
  draggableAccessor={() => true}
  resizable={true}
  onSelectSlot={handleSlotSelect}      // Create events
  onSelectEvent={handleEventSelect}    // Edit events
  onEventDrop={handleEventDrop}        // Drag & drop
  onEventResize={handleEventResize}    // Resize events
  components={{
    event: CalendarEventComponent,     // Custom event rendering
    toolbar: () => null,              // Custom toolbar used
  }}
/>
```

## Current Implementation Status

### ✅ Completed Features

#### Interactive Calendar System
- **Full Event Management**: Create, edit, delete events with confirmation
- **Drag & Drop**: Move events between dates and times
- **Event Resizing**: Change event duration by dragging edges
- **Multiple Views**: Day, week, work week, month views with custom navigation
- **Responsive Design**: Mobile-optimized with touch-friendly interactions

#### State Management
- **Zustand Store**: Centralized state with specialized hooks
- **Optimistic Updates**: Immediate UI feedback with error recovery
- **Loading States**: Visual feedback during async operations
- **Error Handling**: User-friendly error messages and recovery

#### User Interface
- **Modal System**: EventModal, EventForm, DeleteConfirmationDialog
- **Form Handling**: Date/time inputs, event type selection, descriptions
- **Accessibility**: Dialog descriptions, keyboard navigation
- **Styling**: Custom CSS with Tailwind, glassmorphism effects

#### Developer Experience
- **TypeScript**: Comprehensive type coverage with strict configuration
- **Component Architecture**: Modular, reusable, well-documented components
- **Performance**: React.memo, useCallback optimizations
- **Code Quality**: ESLint compliant, no TypeScript errors

### 🚧 Ready for Integration

#### Backend API Points
```typescript
// Store methods ready for API integration
interface CalendarAPI {
  GET '/api/events' → CalendarEvent[]
  POST '/api/events' → CalendarEvent
  PUT '/api/events/:id' → CalendarEvent
  DELETE '/api/events/:id' → { success: boolean }
  PATCH '/api/events/:id/move' → CalendarEvent
}
```

#### Database Schema Ready
```sql
-- Recommended table structure
CREATE TABLE events (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Development Workflow

### Package Management
- **Manager**: PNPM exclusively (faster, more efficient)
- **Lock File**: `pnpm-lock.yaml` committed to repository
- **Installation**: `pnpm install` (not npm install)

### Development Commands
```bash
# Development
pnpm dev          # Start development server (http://localhost:3000)

# Building
pnpm build        # Production build
pnpm start        # Start production server

# Code Quality
pnpm lint         # ESLint checks
npx tsc --noEmit  # TypeScript type checking
```

### File Structure Conventions
- **Absolute Imports**: `@/*` maps to `./src/*`
- **Component Naming**: PascalCase for components, camelCase for utilities
- **File Naming**: kebab-case for pages, PascalCase for components
- **Type Definitions**: Separate `.types.ts` files for complex interfaces

### Styling Approach
- **Tailwind CSS 4**: Latest version with `@theme inline` syntax
- **CSS Variables**: Custom properties in `globals.css`
- **Component Styles**: Co-located CSS files when needed
- **Responsive Design**: Mobile-first with `sm:`, `md:`, `lg:`, `xl:` breakpoints

## Current Routes & Pages

### Public Routes (Landing Group)
- **`/`** - Home page with hero section and navigation
- **`/about`** - About page (if implemented)

### Authenticated Routes (Dashboard Group)
- **`/dashboard`** - Main dashboard with interactive calendar
- **`/calendar`** - Dedicated calendar page (same functionality)

### Layout Hierarchy
```
Root Layout (fonts, globals)
├── Landing Layout (navbar, footer)
│   └── Landing pages
└── Dashboard Layout (sidebar navigation)
    └── Dashboard pages (calendar functionality)
```

## Future Refactoring Roadmap

### Phase 1: Backend Integration (Immediate)
**Timeline**: 1-2 weeks  
**Priority**: HIGH

#### API Integration Tasks
- Replace simulated async calls with real API endpoints
- Implement proper error handling for network failures
- Add authentication middleware for calendar access
- Set up database schema for events and users

#### Files to Modify
- `src/stores/calendarStore.ts` - Replace mock functions with API calls
- Add `src/lib/api.ts` - API client configuration
- Add `src/hooks/useAuth.ts` - Authentication management

### Phase 2: Real-time Features (Next)
**Timeline**: 2-3 weeks  
**Priority**: MEDIUM

#### Collaborative Features
- WebSocket integration for real-time calendar updates
- Multi-user event editing with conflict resolution
- Live cursor tracking during event creation
- Push notifications for event updates

#### Technical Implementation
- WebSocket connection management
- Event conflict resolution algorithms
- Real-time state synchronization patterns

### Phase 3: Architecture Improvements
**Timeline**: 1-2 weeks  
**Priority**: MEDIUM

#### Code Quality Enhancements
- Split large `calendarStore.ts` into focused stores
- Implement comprehensive test suite (Jest + React Testing Library)
- Add error boundaries for production reliability
- Performance monitoring and optimization

#### Developer Experience
- Storybook for component documentation
- E2E testing with Playwright
- CI/CD pipeline for automated testing and deployment

### Phase 4: Feature Expansion
**Timeline**: 3-4 weeks  
**Priority**: LOW

#### Advanced Calendar Features
- Recurring event patterns (daily, weekly, monthly)
- Event categories and filtering system
- Calendar import/export (iCalendar format)
- Event search and advanced filtering
- Event templates for quick creation

#### AI-Powered Features
- Smart event scheduling suggestions
- Automatic conflict detection and resolution
- Natural language event creation
- Meeting analytics and insights

## Critical Files for Next Session

### Core Calendar Implementation
- `src/stores/calendarStore.ts` - Central state management (356 lines)
- `src/components/calendar/Calendar.tsx` - Main calendar container
- `src/components/calendar/components/CalendarGrid.tsx` - BigCalendar integration
- `src/components/calendar/types/calendar.types.ts` - Type definitions

### Backend Integration Points
- `src/app/(dashboard)/dashboard/page.tsx` - Dashboard route
- `src/app/(dashboard)/calendar/page.tsx` - Calendar route  
- `src/components/calendar/components/EventForm.tsx` - Form handling

### Configuration Files
- `package.json` - Dependencies and scripts
- `CLAUDE.md` - Project guidelines and patterns
- `tsconfig.json` - TypeScript configuration

## Next Session Priorities

1. **Backend API Integration** - Replace mock store actions with real API calls
2. **Database Setup** - Implement events table schema and connections
3. **Authentication** - Add user session management for calendar access
4. **Error Handling** - Improve error boundaries and user feedback
5. **Testing** - Add comprehensive test coverage for calendar functionality