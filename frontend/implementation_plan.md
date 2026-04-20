# Authentication Implementation Plan

## Overview
This document outlines the step-by-step plan to implement authentication features and integrate them with the existing calendar system in NotebookLM.

## Current State Analysis

### ✅ What We Have
- **Frontend**: Fully functional calendar system with Zustand state management
- **Backend**: Complete authentication API with Google OAuth integration
- **Architecture**: Next.js 16.2.2 with App Router, TypeScript, Tailwind CSS 4
- **Calendar**: Interactive calendar with CRUD operations, drag-and-drop functionality

### 🚧 What We Need
- Authentication integration in frontend
- Calendar API integration with backend
- Protected routes and user session management
- Token management and refresh logic

---

## Implementation Plan

### Phase 1: Authentication Foundation
**Estimated Time**: 1-2 days  
**Agent Type**: Frontend Agent

#### Step 1.1: Create API Service Layer
- **File**: `src/lib/api.ts`
- **Purpose**: Central API client with token management and auto-refresh
- **Features**:
  - Base fetch wrapper with error handling
  - JWT token management (storage, refresh, clear)
  - Automatic token refresh on 401 errors
  - Request/response interceptors

#### Step 1.2: Create Authentication Hook
- **File**: `src/hooks/useAuth.ts`
- **Purpose**: React hook for authentication state management
- **Features**:
  - User authentication state
  - Login/logout methods
  - Loading states
  - Token validation
  - Integration with API service

#### Step 1.3: Create Authentication Store
- **File**: `src/stores/authStore.ts`
- **Purpose**: Zustand store for global authentication state
- **Features**:
  - User information storage
  - Authentication status
  - Login/logout actions
  - Token management
  - Integration with existing calendar store

### Phase 2: Authentication UI Components
**Estimated Time**: 1 day  
**Agent Type**: Frontend Agent

#### Step 2.1: Login/Logout Components
- **Files**: 
  - `src/components/auth/LoginButton.tsx`
  - `src/components/auth/LogoutButton.tsx`
  - `src/components/auth/UserProfile.tsx`
- **Purpose**: UI components for authentication
- **Features**:
  - Google OAuth login button
  - User profile display
  - Logout functionality
  - Loading states

#### Step 2.2: Authentication Callback Handler
- **File**: `src/app/auth/callback/page.tsx`
- **Purpose**: Handle OAuth callback from Google
- **Features**:
  - Extract tokens from URL/backend response
  - Store tokens in localStorage/cookies
  - Redirect to appropriate page
  - Error handling for failed authentication

### Phase 3: Route Protection
**Estimated Time**: 1 day  
**Agent Type**: Frontend Agent

#### Step 3.1: Create Route Protection HOC/Hook
- **File**: `src/components/auth/ProtectedRoute.tsx`
- **Purpose**: Protect dashboard routes from unauthenticated access
- **Features**:
  - Check authentication status
  - Redirect to login if not authenticated
  - Loading states during auth check
  - Support for both components and pages

#### Step 3.2: Update Layout Components
- **Files**: 
  - `src/app/(dashboard)/layout.tsx`
  - `src/components/shared/Navigation.tsx`
- **Purpose**: Add authentication UI to layouts
- **Features**:
  - Add login/logout buttons to navigation
  - User profile display in dashboard
  - Conditional rendering based on auth status

### Phase 4: Calendar Backend Integration
**Estimated Time**: 2-3 days  
**Agent Type**: Frontend Agent

#### Step 4.1: Update Calendar Store API Methods
- **File**: `src/stores/calendarStore.ts`
- **Purpose**: Replace mock functions with real API calls
- **Current Mock Methods to Update**:
  - `createEvent()` → `POST /calendar/events`
  - `updateEvent()` → `PUT /calendar/events/:id`
  - `deleteEvent()` → `DELETE /calendar/events/:id`
  - `loadEvents()` → `GET /calendar/events`
  - `moveEvent()` → `PATCH /calendar/events/:id/move`

#### Step 4.2: Add Calendar API Service
- **File**: `src/lib/calendarApi.ts`
- **Purpose**: Dedicated calendar API methods
- **Features**:
  - Get user calendars
  - CRUD operations for events
  - Batch operations for multiple events
  - Error handling and retry logic

#### Step 4.3: Update Calendar Components
- **Files**: 
  - `src/components/calendar/components/CalendarGrid.tsx`
  - `src/components/calendar/components/EventForm.tsx`
- **Purpose**: Handle API loading states and errors
- **Features**:
  - Loading indicators during API calls
  - Error messages for failed operations
  - Optimistic updates with rollback on error

### Phase 5: Error Handling & User Experience
**Estimated Time**: 1 day  
**Agent Type**: Frontend Agent

#### Step 5.1: Enhanced Error Handling
- **Files**: 
  - `src/components/ui/ErrorBoundary.tsx`
  - `src/components/ui/Toast.tsx`
- **Purpose**: Better error handling and user feedback
- **Features**:
  - Global error boundary for unhandled errors
  - Toast notifications for API errors
  - Retry mechanisms for failed requests
  - Offline state detection

#### Step 5.2: Loading States
- **Files**: Various calendar components
- **Purpose**: Improve UX during API operations
- **Features**:
  - Skeleton loaders for calendar events
  - Loading spinners for form submissions
  - Disabled states during operations

### Phase 6: Testing & Polish
**Estimated Time**: 1-2 days  
**Agent Type**: Code Reviewer Agent

#### Step 6.1: Integration Testing
- **Purpose**: Ensure authentication flow works end-to-end
- **Tests**:
  - Login/logout flow
  - Token refresh mechanism
  - Protected route access
  - Calendar API integration
  - Error scenarios

#### Step 6.2: Code Review & Optimization
- **Purpose**: Code quality and performance review
- **Focus Areas**:
  - TypeScript type safety
  - Error handling completeness
  - Performance optimizations
  - Security best practices
  - Code organization

---

## Agent Coordination Plan

### Agent Assignment Strategy

#### Frontend Agent Tasks
- **Primary Responsibility**: UI components, React hooks, state management
- **Key Files**: Components, hooks, stores, pages
- **Duration**: Most of the implementation phases

#### Code Reviewer Agent Tasks
- **Primary Responsibility**: Code quality, security review, testing
- **Key Focus**: Final review of authentication implementation
- **Duration**: End of each phase for review

### Inter-Agent Communication Protocol

#### After Each Phase
1. **Status Update**: Update project_state.md with progress
2. **Code Review**: Have code reviewer agent review implementation
3. **Testing**: Verify integration points work correctly
4. **Documentation**: Update implementation plan with any changes

---

## Risk Assessment & Mitigation

### High Risk Areas

#### Security Concerns
- **Risk**: Token storage vulnerability
- **Mitigation**: Use httpOnly cookies for sensitive tokens, implement proper CSRF protection

#### API Integration
- **Risk**: Backend API changes breaking frontend
- **Mitigation**: Version API endpoints, implement comprehensive error handling

#### User Experience
- **Risk**: Poor UX during authentication flow
- **Mitigation**: Proper loading states, clear error messages, smooth redirects

### Testing Strategy

#### Manual Testing Checklist
- [ ] Login with Google OAuth works
- [ ] Token refresh happens automatically
- [ ] Protected routes redirect properly
- [ ] Calendar loads user's real events
- [ ] CRUD operations work with backend
- [ ] Logout clears all user data
- [ ] Error states display properly

---

## Success Criteria

### Phase 1 Complete ✓
- API service layer created and tested
- Authentication hook works with real backend
- Token management handles refresh automatically

### Phase 2 Complete ✓
- Login/logout UI components functional
- OAuth callback handler works
- User can authenticate via Google

### Phase 3 Complete ✓
- Dashboard routes protected from unauthenticated access
- Navigation shows appropriate login/logout options
- User profile displays correctly

### Phase 4 Complete ✓
- Calendar loads real events from backend
- All CRUD operations work with API
- Error handling for API failures

### Phase 5 Complete ✓
- Comprehensive error handling implemented
- Good user experience during loading states
- Toast notifications for user feedback

### Phase 6 Complete ✓
- All tests passing
- Code reviewed and optimized
- Production ready implementation

---

## Implementation Decisions ✅

Based on user requirements:

1. **Token Storage**: Use **httpOnly cookies** for JWT tokens (secure, XSS-resistant)

2. **Error Handling Strategy**: 
   - Expired refresh tokens → Send query to `/refresh` endpoint
   - Network connectivity issues → Show toast notifications
   - Backend service unavailable → Graceful fallback with user feedback

3. **User Experience**: 
   - Focus on real-time calendar integration with backend
   - No offline functionality needed for initial implementation

4. **Testing Requirements**: 
   - No automated tests needed initially
   - User will review code manually

5. **Code Review Schedule**:
   - Update project state **every 2 phases**
   - No separate code review agent needed
   - User will review implementation directly

---

## Next Steps

Once you approve this plan and answer the clarification questions, I will:

1. **Start Phase 1** by coordinating with the Frontend Agent to create the API service layer
2. **Update project_state.md** with implementation progress
3. **Proceed step-by-step** through each phase with regular check-ins
4. **Coordinate code reviews** at the end of each phase

Are you ready to proceed with this implementation plan?