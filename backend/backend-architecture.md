# Backend Architecture for Frontend Integration

## 🚀 Backend Status: ✅ FULLY INTEGRATED

**Backend URL:** `http://localhost:8000`
**Frontend Integration:** ✅ Complete with httpOnly cookies and persistent authentication

---

## 🔐 Authentication

### Authorization Flow:
1. **User clicks "Login with Google"** → redirect to `GET /auth/google`
2. **Google OAuth** → user authorizes
3. **Callback** → `GET /auth/callback` returns JWT tokens
4. **Frontend saves tokens** and uses them for API requests

### Endpoints:

#### `GET /auth/google`
**Description:** Initiate Google OAuth  
**Usage:** Redirect user to this link for login
```javascript
window.location.href = 'http://localhost:8000/auth/google';
```

#### `GET /auth/google/callback` 
**Description:** Handle Google callback (automatic)
**Implementation:** 
- Exchanges authorization code for Google tokens
- Creates/updates user in database
- Generates JWT access/refresh tokens
- Sets httpOnly cookies with tokens
- Redirects to frontend with user data

**Response:** Redirect to frontend with user data
```
Location: http://localhost:3000/auth/callback?user={encodedUserData}

Set-Cookie: accessToken=jwt-token; HttpOnly; Secure; SameSite=Strict; Max-Age=1800
Set-Cookie: refreshToken=jwt-token; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

#### `POST /auth/refresh`
**Description:** Refresh expired JWT tokens
**Body:**
```json
{
  "refreshToken": "current-refresh-token"
}
```
**Response:**
```json
{
  "accessToken": "new-jwt-access-token",
  "refreshToken": "new-jwt-refresh-token"
}
```

#### `GET /auth/user`
**Description:** Get current authenticated user
**Headers:** Automatically reads httpOnly cookies
**Authentication:** Validates JWT access token from httpOnly cookies
**Response (200):**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@gmail.com",
    "name": "User Name", 
    "picture": "https://avatar-url"
  }
}
```
**Response (401):**
```json
{
  "error": "Not authenticated"
}
```

#### `POST /auth/logout`
**Description:** Logout from system
**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

## 📅 Calendar API

**⚠️ All calendar endpoints require authentication!**  
Authentication is handled automatically via httpOnly cookies.

#### `GET /calendar/calendars`
**Description:** Get user's calendar list
**Authentication:** Automatic via httpOnly cookies
**Response:**
```json
{
  "items": [
    {
      "id": "primary",
      "summary": "Main Calendar",
      "description": "User's primary calendar"
    }
  ]
}
```

#### `GET /calendar/events`
**Description:** Get calendar events
**Authentication:** Automatic via httpOnly cookies
**Query Parameters:**
- `calendarId` (optional) - Calendar ID (default: "primary")
- `timeMin` (optional) - Start date in ISO format
- `timeMax` (optional) - End date in ISO format

**Example:**
```
GET /calendar/events?calendarId=primary&timeMin=2024-01-01T00:00:00Z&timeMax=2024-12-31T23:59:59Z
```

**Response:**
```json
{
  "items": [
    {
      "id": "event-id",
      "summary": "Meeting",
      "start": {
        "dateTime": "2024-01-15T10:00:00Z"
      },
      "end": {
        "dateTime": "2024-01-15T11:00:00Z"
      }
    }
  ]
}
```

---

## ⚡ Utility Endpoints

#### `GET /health`
**Description:** Check server status
**Response:**
```json
{
  "status": "ok"
}
```

---

## 🔧 Frontend Integration Guide

### 1. Axios Configuration (Implemented)

**File:** `src/api/axios.ts`
```typescript
import axios from 'axios';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true  // Enables httpOnly cookie sending
});
```

### 2. Authentication Store (Zustand)

**File:** `src/stores/authStore.ts`
```typescript
import { create } from 'zustand';
import { User } from '@/types/User';
import { api } from '@/api/axios';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setUser: (user: User | null) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;  // Calls /auth/user endpoint
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
  
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/auth/user');
      if (response.data.user) {
        set({ user: response.data.user, isAuthenticated: true });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
```

### 3. Authentication Initialization

**File:** `src/components/AuthInitializer.tsx`
```typescript
"use client";
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function AuthInitializer() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth(); // Validates httpOnly cookies on page load
  }, [checkAuth]);

  return null;
}
```

**Integration in Root Layout:**
```typescript
// src/app/layout.tsx
import { AuthInitializer } from '@/components/AuthInitializer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthInitializer />  {/* Runs on every page load */}
        {children}
      </body>
    </html>
  );
}
```

### 4. Authentication Flow Implementation

**Signup/Login Page:**
```typescript
// src/app/signup/page.tsx
"use client";

export default function SignupPage() {
  function handleLogin() {
    // Direct redirect - no axios for OAuth
    window.location.href = 'http://localhost:8000/auth/google';
  }
  
  return (
    <button onClick={handleLogin}>
      Login with Google
    </button>
  );
}
```

**OAuth Callback Handler:**
```typescript
// src/app/auth/callback/page.tsx
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { parseUserFromUrl } from '@/utils/auth';

export default function CallbackPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user');
    
    if (userParam) {
      const userData = parseUserFromUrl(userParam);
      if (userData) {
        setUser(userData);  // Tokens are already in httpOnly cookies
        router.push('/dashboard');
      }
    }
  }, [router, setUser]);

  return <div>Completing login...</div>;
}
```

---

## 🚨 Error Handling

Backend returns errors in format:
```json
{
  "error": "Error message",
  "details": [] // for validation errors
}
```

**HTTP Status codes:**
- `401` - Unauthorized (no token or expired)
- `403` - Forbidden (invalid token)  
- `400` - Bad Request (validation errors)
- `500` - Server Error

---

## 🔄 Auto Token Refresh

Backend automatically refreshes Google tokens when they expire. 
Frontend should handle JWT token expiration via `/auth/refresh`.

---

## 🌐 CORS

Backend is configured to work with frontend on `http://localhost:3000`.

---

## ✅ Ready to use!

Backend is fully ready for integration. All endpoints are tested and working.