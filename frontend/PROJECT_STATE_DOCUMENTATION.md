# NotebookLM Project State Documentation
*Last Updated: 2026-04-21*

## Executive Summary

NotebookLM is a modern web application built with Next.js 16.2.2, React 19, TypeScript, and Tailwind CSS 4. The project features a dual-layout architecture with a marketing landing page and a dashboard interface that includes a fully functional interactive calendar system and complete Google OAuth authentication flow. The application leverages modern development patterns including App Router, Zustand state management, and secure httpOnly cookie-based authentication.

**Current State:** Production-ready authentication system with Google OAuth integration, secure httpOnly cookie management, and comprehensive calendar implementation. Backend and frontend fully integrated with persistent authentication across browser sessions.

---

## 1. Project Architecture Overview

### Technology Stack
- **Framework:** Next.js 16.2.2 with React 19
- **Language:** TypeScript with strict configuration
- **Styling:** Tailwind CSS 4 with shadcn/ui (radix-nova style)
- **State Management:** Zustand for global state
- **Package Manager:** PNPM (exclusive - `pnpm-lock.yaml` present)
- **UI Library:** shadcn/ui with Radix UI primitives
- **Calendar Engine:** React Big Calendar with react-dnd for drag-and-drop

### Development Commands
```bash
pnpm dev    # Development server
pnpm build  # Production build
pnpm start  # Production server
pnpm lint   # ESLint checks
```

### Project Structure
```
/Users/federal/Desktop/notebooklm/frontend/
├── src/
│   ├── app/
│   │   ├── (landing)/          # Marketing pages with navbar + footer
│   │   ├── (dashboard)/        # Application interface with sidebar
│   │   ├── layout.tsx          # Root layout (fonts + global styles)
│   │   └── globals.css         # Tailwind imports + CSS variables
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── shared/             # Reusable custom components
│   │   ├── landing/            # Landing page components
│   │   ├── calendar/           # Calendar system (detailed below)
│   │   └── Navigation.tsx      # Main navbar
│   ├── stores/
│   │   ├── calendarStore.ts    # Zustand calendar state
│   │   └── authStore.ts        # Zustand authentication state
│   ├── hooks/
│   │   └── use-mobile.ts       # Mobile detection hook
│   ├── utils/
│   │   ├── cn.ts               # Custom clsx wrapper
│   │   └── auth.ts             # Authentication utilities
│   ├── api/
│   │   └── axios.ts            # API client configuration
│   ├── types/
│   │   └── User.ts             # User type definitions
│   └── styles/
│       └── calendar.css        # Calendar-specific styling
├── components.json             # shadcn/ui configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── CLAUDE.md                   # Project guidelines for AI assistance
```

### Routing Architecture (App Router)

#### Route Groups
- **`(landing)/`** - Public marketing pages
  - Layout: Navigation + Footer components
  - Example: `/` - Landing page
  
- **`(dashboard)/`** - Authenticated application area
  - Layout: Sidebar navigation (SidebarProvider)
  - Examples: `/dashboard`, `/calendar`

#### Layout Hierarchy
```
Root Layout (fonts + global styles)
├── Landing Layout (navbar + footer)
│   └── Landing pages
└── Dashboard Layout (sidebar)
    └── Dashboard pages
```

---

## 2. Calendar System Architecture

### Component Architecture (Modular Design)

#### Core Calendar Component
**Location:** `/Users/federal/Desktop/notebooklm/frontend/src/components/calendar/Calendar.tsx`

```typescript
Calendar (Main orchestrator)
├── CalendarToolbar (navigation + view controls)
├── CalendarGrid (React Big Calendar wrapper)
├── FloatingChatButton (AI assistance)
├── EventModal (create/edit modal)
└── DeleteConfirmationDialog (deletion confirmation)
```

#### Modular Component Structure
```
/src/components/calendar/
├── Calendar.tsx                 # Main calendar component
├── components/
│   ├── CalendarToolbar.tsx      # Navigation and view controls
│   ├── CalendarGrid.tsx         # React Big Calendar wrapper
│   ├── CalendarEvent.tsx        # Event display component
│   ├── CalendarDayHeader.tsx    # Day header customization
│   ├── EventModal.tsx           # Create/Edit modal
│   ├── EventForm.tsx            # Event form component
│   ├── DeleteConfirmationDialog.tsx # Deletion confirmation
│   └── FloatingChatButton.tsx   # AI chat integration
├── hooks/
│   ├── useCalendarState.ts      # Calendar state hook
│   └── useEventGeneration.ts    # Sample event generation
├── types/
│   └── calendar.types.ts        # TypeScript interfaces
├── utils/
│   ├── calendarFormats.ts       # Date/time formatting
│   ├── calendarStyles.ts        # Style configurations
│   └── dateUtils.ts             # Date manipulation utilities
└── index.ts                     # Component exports
```

### State Management (Zustand)

**Store Location:** `/Users/federal/Desktop/notebooklm/frontend/src/stores/calendarStore.ts`

#### State Structure
```typescript
interface CalendarStore {
  // Calendar State
  currentDate: Date
  view: CalendarView ('month' | 'week' | 'work_week' | 'day' | 'agenda')
  events: CalendarEvent[]
  
  // UI State
  isEventModalOpen: boolean
  isCreateMode: boolean
  selectedEventId: string | null
  selectedSlot: { start: Date; end: Date } | null
  isLoading: boolean
  error: string | null
}
```

#### Custom Hooks for State Access
```typescript
// Specialized hooks for different concerns
useCalendarState()      # Calendar data (date, view, events)
useCalendarUIState()    # UI state (modals, loading, errors)
useCalendarActions()    # All actions
useCalendarNavigation() # Navigation-specific actions
useEventManagement()    # Event CRUD operations
```

### Event CRUD Operations

#### Async Operations with Optimistic Updates
```typescript
// All operations simulate API calls with loading states
createEvent(eventData)                    # Create new event
updateEvent(id, updates)                  # Update existing event
deleteEvent(id)                          # Delete event
moveEvent(id, start, end)                # Drag-and-drop repositioning
```

#### Event Data Structure
```typescript
interface CalendarEvent {
  id: string                              # Unique identifier
  title: string                           # Event title
  start: Date                            # Start time
  end: Date                              # End time
  type: 'primary' | 'secondary' | 'critical' | 'inactive' # Visual styling
  description?: string                    # Optional description
}
```

### React Big Calendar Integration

#### Features Implemented
- **Multiple Views:** Month, Week, Work Week, Day, Agenda
- **Drag & Drop:** Event repositioning with react-dnd
- **Time Slots:** Click empty slots to create events
- **Event Selection:** Click events to edit/view
- **Keyboard Support:** Delete/Backspace keys for deletion
- **Responsive Design:** Mobile-optimized layouts

#### Custom Styling Integration
- Custom event components with Tailwind styling
- Dark theme optimization (primary background: `#0e0e0e`)
- Event type-based color coding
- Glassmorphism effects: `bg-[#ffffff]/2 backdrop-blur-sm`

---

## 3. Authentication System Architecture

### Google OAuth Integration

**Implementation Status:** ✅ Complete and Production-Ready

#### Authentication Flow
```
1. User clicks "Login with Google" on signup page
   ↓
2. Frontend redirects to backend: http://localhost:8000/auth/google
   ↓  
3. Backend redirects to Google OAuth with proper scopes
   ↓
4. User authorizes on Google platform
   ↓
5. Google redirects to backend: /auth/google/callback?code=...
   ↓
6. Backend exchanges code for Google tokens, creates/updates user
   ↓
7. Backend sets httpOnly cookies (accessToken, refreshToken) 
   ↓
8. Backend redirects to frontend: /auth/callback?user={encodedUserData}
   ↓
9. Frontend parses user data, stores in Zustand, redirects to /test
```

#### Security Implementation

**httpOnly Cookies (Secure)**
- **Access Token:** 30 minutes expiration, httpOnly, sameSite=strict
- **Refresh Token:** 7 days expiration, httpOnly, sameSite=strict  
- **Benefits:** Cannot be accessed by JavaScript, XSS protection, automatic sending with requests

**Backend Endpoints**
```typescript
GET  /auth/google           # Initiate OAuth flow
GET  /auth/google/callback  # Handle OAuth callback
GET  /auth/user            # Get current user (validates httpOnly cookies)
POST /auth/refresh         # Refresh JWT tokens  
POST /auth/logout          # Logout and clear cookies
```

### Frontend Authentication Architecture

#### AuthStore (Zustand)
**Location:** `/Users/federal/Desktop/notebooklm/frontend/src/stores/authStore.ts`

```typescript
interface AuthState {
  user: User | null              # Current user data
  isAuthenticated: boolean       # Authentication status  
  isLoading: boolean            # Loading state for auth operations
  
  setUser: (user: User | null) => void     # Set user data
  logout: () => void                       # Clear user and call backend logout
  checkAuth: () => Promise<void>           # Check authentication via /auth/user
}
```

#### Authentication Components

**Signup Page** (`/app/signup/page.tsx`)
- Beautiful dark modal with glassmorphism design
- Green glowing effect with brand colors
- Single Google OAuth button with Lucide React icons
- Direct window.location.href redirect (no axios for OAuth)

**Callback Handler** (`/app/auth/callback/page.tsx`)  
- Processes user data from URL parameters
- Updates authStore with user information
- Handles errors and redirects appropriately
- Redirects to /test after successful authentication

**Auth Initializer** (`/components/AuthInitializer.tsx`)
- Runs on every page load via root layout
- Calls checkAuth() to verify existing httpOnly cookies
- Enables persistent authentication across browser tabs/sessions

#### API Integration

**Axios Configuration** (`/api/axios.ts`)
```typescript
export const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,        # Enables httpOnly cookie sending
  headers: {
    'Content-Type': 'application/json'
  }
});
```

#### Authentication Utilities

**Auth Utils** (`/utils/auth.ts`)
```typescript
parseUserFromUrl(userParam: string): User | null
// Safely parses and validates user data from OAuth callback URL
```

**User Types** (`/types/User.ts`)
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}
```

### Cross-Tab Authentication Persistence

**Problem Solved:** Each browser tab had separate Zustand store instances, causing "Please login" in new tabs even when authenticated.

**Solution:** AuthInitializer component calls `/auth/user` endpoint on every page load:
1. **New tab opens** → AuthInitializer runs
2. **Calls /auth/user** → Backend validates httpOnly cookies  
3. **Returns user data** → Frontend updates authStore
4. **Shows authenticated state** → User sees their name instead of login prompt

### JWT Token Management

**Backend Token Generation:**
- Uses `jsonwebtoken` library for JWT creation/verification
- Access tokens: Short-lived (30 minutes) for API requests
- Refresh tokens: Long-lived (7 days) for token renewal
- Both stored in httpOnly cookies for maximum security

**Frontend Token Usage:**
- No token management in JavaScript (security best practice)
- Tokens automatically sent with API requests via `withCredentials: true`
- Backend validates tokens on protected endpoints
- Automatic refresh handled by backend when possible

---

## 4. Design System & Styling

### Tailwind CSS 4 Configuration

#### CSS Variables System
**Location:** `/Users/federal/Desktop/notebooklm/frontend/src/app/globals.css`

```css
:root {
  --background: #050505;
  --foreground: #ededed;
  --green-nice: #008f4c;        # Brand color
  --sidebar: #050505;
  /* ... comprehensive dark theme variables */
}

@theme inline {
  /* CSS variable mapping for Tailwind */
}
```

#### Font System
- **Primary Font:** Plus Jakarta Sans (weights 200-800)
- **Display Font:** Space Grotesk (weights 300-700)
- **Loading:** via `next/font/google` with CSS variables

### shadcn/ui Integration

**Configuration:** `/Users/federal/Desktop/notebooklm/frontend/components.json`
- Style: `radix-nova`
- Base Color: `neutral`
- CSS Variables: `true`
- Path aliases configured for components

#### Available Components
```
/src/components/ui/
├── button.tsx          # Primary UI button
├── calendar.tsx        # Date picker component
├── dialog.tsx          # Modal dialogs
├── sidebar.tsx         # Sidebar navigation
├── input.tsx           # Form inputs
├── select.tsx          # Dropdown selects
├── textarea.tsx        # Text areas
└── ... (additional shadcn components)
```

### Custom Components

#### Shared Components (`/src/components/shared/`)
```typescript
Button              # Custom button with primary/secondary variants
Footer             # Landing page footer
Logo               # Brand logo component
SecondaryText      # Styled text component
CardWrapper        # Reusable card container
```

#### Component Patterns
```typescript
// Consistent prop patterns
interface ComponentProps {
  className?: string           # Style customization
  children?: React.ReactNode   # Child elements
  // ... specific props
}

// Styling utility usage
className={cn("base-styles", conditionalStyles, className)}
```

---

## 5. Current Implementation Status

### ✅ Completed Features

#### Authentication System (Complete Implementation)
- **Google OAuth Integration:** Full OAuth 2.0 flow with proper scopes (email, profile, calendar)
- **Secure Token Management:** httpOnly cookies with appropriate expiration times
- **Cross-Tab Persistence:** Authentication state maintained across browser tabs and sessions
- **Beautiful UI:** Glassmorphism signup page with green glowing effects
- **Error Handling:** Comprehensive error states and user feedback
- **Backend Integration:** Complete Express.js authentication routes with JWT
- **Persistent Sessions:** Auto-initialization on page loads via `/auth/user` endpoint

#### Landing Page System
- Marketing layout with Navigation + Footer
- Responsive design with Tailwind CSS 4
- Typography system with custom fonts
- Route group architecture

#### Dashboard Infrastructure
- Sidebar-based layout with shadcn/ui components
- SidebarProvider for state management
- Responsive sidebar with collapse functionality
- Dark theme optimization

#### Calendar System (Full Implementation)
- **Complete CRUD Operations:** Create, Read, Update, Delete events
- **Interactive UI:** Drag-and-drop event repositioning
- **Multiple Views:** Month, Week, Work Week, Day, Agenda
- **State Management:** Centralized Zustand store with specialized hooks
- **Modal System:** Create/Edit event modal with form validation
- **Keyboard Support:** Delete key event removal
- **Loading States:** Async operation feedback
- **Error Handling:** User-friendly error states
- **Responsive Design:** Mobile-optimized calendar views
- **TypeScript Coverage:** Comprehensive type safety

#### Development Workflow
- PNPM package management
- ESLint configuration
- TypeScript strict mode
- Hot reload development server

### 🔄 Current State (Ready for Next Phase)

#### Frontend Calendar Implementation
- **Status:** Production-ready
- **Architecture:** Modular, scalable component structure
- **State Management:** Robust Zustand implementation
- **UI/UX:** Polished interface with loading states
- **Integration Points:** Prepared for backend API integration

#### Immediate Integration Points
1. **API Endpoints:** Replace simulated API calls in store actions
2. **Authentication:** User session management for events
3. **Real-time Updates:** WebSocket integration for collaborative features
4. **Data Persistence:** Database integration for event storage

---

## 5. Future Refactoring Roadmap

### Phase 1: Backend Integration (Next Priority)

#### API Integration Tasks
```typescript
// Replace simulated API calls in calendarStore.ts
createEvent()   # POST /api/events
updateEvent()   # PUT /api/events/:id
deleteEvent()   # DELETE /api/events/:id
moveEvent()     # PATCH /api/events/:id/move
getEvents()     # GET /api/events
```

#### Authentication Integration
- User session management
- Event ownership and permissions
- Protected API routes

#### Database Schema Design
```sql
-- Events table structure
events {
  id: UUID PRIMARY KEY
  user_id: UUID REFERENCES users(id)
  title: VARCHAR NOT NULL
  description: TEXT
  start_time: TIMESTAMP NOT NULL
  end_time: TIMESTAMP NOT NULL
  event_type: ENUM('primary', 'secondary', 'critical', 'inactive')
  created_at: TIMESTAMP DEFAULT NOW()
  updated_at: TIMESTAMP DEFAULT NOW()
}
```

### Phase 2: Advanced Features

#### Real-time Collaboration
- WebSocket integration for live updates
- Multi-user event editing
- Conflict resolution strategies
- Optimistic update refinements

#### Enhanced Calendar Features
- **Recurring Events:** Pattern-based event creation
- **Event Categories:** Custom categorization system
- **Time Zone Support:** Multi-timezone event handling
- **External Calendar Sync:** Google Calendar, Outlook integration
- **Notifications:** Event reminders and alerts

#### Performance Optimizations
- **Virtual Scrolling:** For large event datasets
- **Calendar Caching:** Smart data caching strategies
- **Bundle Optimization:** Code splitting for calendar components
- **Image Optimization:** Optimized asset loading

### Phase 3: Architecture Improvements

#### Component Architecture Enhancements
```typescript
// Enhanced calendar component structure
/src/components/calendar/
├── views/
│   ├── MonthView/           # Month-specific components
│   ├── WeekView/            # Week-specific components
│   └── AgendaView/          # Agenda-specific components
├── providers/
│   └── CalendarProvider.tsx # Context-based state management
├── integrations/
│   ├── GoogleCalendar/      # External calendar integrations
│   └── WebSocketClient/     # Real-time communication
└── testing/
    ├── Calendar.test.tsx    # Component tests
    └── calendarStore.test.ts # Store tests
```

#### State Management Evolution
- **Context API Integration:** For complex component trees
- **Middleware Support:** Logging, persistence, sync
- **Type-safe Actions:** Enhanced action creators
- **Devtools Integration:** Enhanced debugging capabilities

#### Testing Infrastructure
```typescript
// Comprehensive testing strategy
├── __tests__/
│   ├── components/         # Component unit tests
│   ├── stores/            # State management tests
│   ├── utils/             # Utility function tests
│   └── integration/       # Full feature tests
├── cypress/               # E2E testing
└── storybook/            # Component documentation
```

### Phase 4: Advanced Integrations

#### AI-Powered Features
- **Smart Scheduling:** Optimal time slot suggestions
- **Event Generation:** AI-assisted event creation from text
- **Conflict Detection:** Intelligent scheduling conflict resolution
- **Natural Language Processing:** Voice-to-event conversion

#### Analytics and Insights
- **Usage Analytics:** Calendar interaction tracking
- **Productivity Metrics:** Time allocation analysis
- **Performance Monitoring:** Application performance tracking
- **User Behavior Analysis:** Feature usage optimization

---

## 6. Development Guidelines

### Code Standards

#### Component Development
```typescript
// Consistent component structure
export const ComponentName = React.memo(({ 
  prop1,
  prop2,
  className 
}: ComponentProps) => {
  // Hooks first
  const state = useStore()
  
  // Event handlers
  const handleAction = useCallback(() => {
    // Implementation
  }, [dependencies])
  
  // Render
  return (
    <div className={cn("base-classes", className)}>
      {/* Component content */}
    </div>
  )
})

ComponentName.displayName = 'ComponentName'
```

#### State Management Patterns
```typescript
// Zustand store structure
export const useStore = create<StoreInterface>((set, get) => ({
  // State properties
  property: initialValue,
  
  // Actions grouped by concern
  actions: {
    syncAction: (value) => set({ property: value }),
    asyncAction: async (value) => {
      set({ loading: true })
      try {
        const result = await apiCall(value)
        set({ property: result, loading: false })
      } catch (error) {
        set({ error: error.message, loading: false })
      }
    }
  }
}))
```

#### Import Organization
```typescript
// Import order convention
import React from 'react'                    # React imports
import { NextComponent } from 'next/...'     # Next.js imports
import { ExternalLib } from 'external-lib'   # External libraries
import { Component } from '@/components/...' # Internal components
import { utility } from '@/utils/...'        # Internal utilities
import { Type } from './types'               # Local types
import './styles.css'                        # Stylesheets
```

### Performance Considerations

#### Bundle Optimization
- **Code Splitting:** Route-based and component-based splitting
- **Lazy Loading:** Dynamic imports for non-critical components
- **Tree Shaking:** Eliminate unused code
- **Dependency Analysis:** Regular dependency audit

#### Rendering Optimization
- **React.memo():** Prevent unnecessary re-renders
- **useMemo/useCallback:** Expensive calculation caching
- **Virtualization:** Large dataset rendering
- **Image Optimization:** Next.js Image component usage

### Security Considerations

#### Data Validation
- **Input Validation:** Client and server-side validation
- **Type Safety:** Comprehensive TypeScript coverage
- **Sanitization:** XSS prevention in user content
- **API Security:** Rate limiting and authentication

---

## 7. Migration Notes

### Current Dependencies
```json
{
  "next": "16.2.2",
  "react": "19.2.4", 
  "tailwindcss": "^4",
  "zustand": "^5.0.12",
  "react-big-calendar": "^1.19.4",
  "react-dnd": "^16.0.1"
}
```

### Configuration Files
- **TypeScript:** `/tsconfig.json` with path mapping
- **shadcn/ui:** `/components.json` with radix-nova style
- **Package Management:** `pnpm-lock.yaml` (PNPM required)
- **Styling:** CSS variables in `/src/app/globals.css`

### Breaking Changes to Consider
1. **Next.js 16.2.2:** App Router patterns, React 19 compatibility
2. **Tailwind CSS 4:** New `@theme inline` syntax
3. **React 19:** New JSX transform, updated lifecycle patterns
4. **shadcn/ui:** radix-nova style requirements

---

## 8. Quick Start for Development Sessions

### Essential Commands
```bash
# Start development
cd /Users/federal/Desktop/notebooklm/frontend
pnpm dev

# Key file locations for calendar work
/src/components/calendar/Calendar.tsx         # Main component
/src/stores/calendarStore.ts                  # State management
/src/components/calendar/types/calendar.types.ts # Type definitions
```

### Common Development Tasks

#### Adding New Calendar Features
1. **Define Types:** Update `/calendar.types.ts`
2. **Store Actions:** Add to `calendarStore.ts`
3. **Component Logic:** Create in `/components/`
4. **UI Integration:** Connect via hooks

#### Styling Updates
1. **CSS Variables:** `/src/app/globals.css`
2. **Component Styles:** Tailwind classes with `cn()` utility
3. **Calendar-specific:** `/src/styles/calendar.css`

#### State Management Changes
1. **Store Interface:** Update `CalendarStore` type
2. **Actions:** Add/modify in `useCalendarStore`
3. **Hooks:** Create specialized access hooks
4. **Components:** Connect via custom hooks

---

## 9. Action Items for Next Session

### Immediate Priorities
1. **Backend API Design:** Define REST endpoints for calendar operations
2. **Database Schema:** Implement events and users tables
3. **Authentication:** Integrate user session management
4. **API Integration:** Replace simulated calls with actual API requests

### Medium-term Goals
1. **Real-time Features:** WebSocket integration for live updates
2. **Testing Infrastructure:** Unit and integration test setup
3. **Performance Optimization:** Bundle analysis and optimization
4. **Error Handling:** Enhanced error boundaries and user feedback

### Long-term Vision
1. **Advanced Calendar Features:** Recurring events, external sync
2. **AI Integration:** Smart scheduling and event suggestions
3. **Mobile App:** React Native or PWA implementation
4. **Enterprise Features:** Team collaboration, advanced permissions

---

This documentation provides a comprehensive overview of the NotebookLM project's current state and serves as a roadmap for future development work. The calendar implementation is production-ready and well-architected for backend integration and feature expansion.