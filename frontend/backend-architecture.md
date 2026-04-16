# Backend Architecture for Frontend Integration

## 🚀 Backend Status: READY for integration

**Backend URL:** `http://localhost:8000`

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

#### `GET /auth/callback` 
**Description:** Handle Google callback (automatic)
**Response:**
```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token", 
  "user": {
    "id": "user-id",
    "email": "user@gmail.com",
    "name": "User Name",
    "picture": "https://avatar-url"
  }
}
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
Add header: `Authorization: Bearer <accessToken>`

#### `GET /calendar/calendars`
**Description:** Get user's calendar list
**Headers:**
```
Authorization: Bearer <accessToken>
```
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
**Headers:**
```
Authorization: Bearer <accessToken>
```
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

### 1. API Service

Create `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.accessToken && {
          'Authorization': `Bearer ${this.accessToken}`
        }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // If 401 - try to refresh token
      if (response.status === 401 && this.refreshToken) {
        const newTokens = await this.refreshAccessToken();
        if (newTokens) {
          // Retry request with new token
          config.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return await fetch(url, config);
        }
      }
      
      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async refreshAccessToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const tokens = await response.json();
        this.setTokens(tokens.accessToken, tokens.refreshToken);
        return tokens;
      }
    } catch (error) {
      this.clearTokens();
      return null;
    }
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Calendar methods
  async getCalendars() {
    const response = await this.request('/calendar/calendars');
    return response.json();
  }

  async getEvents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(`/calendar/events?${queryString}`);
    return response.json();
  }

  // Auth methods
  initiateGoogleAuth() {
    window.location.href = `${API_BASE_URL}/auth/google`;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearTokens();
    }
  }
}

export default new ApiService();
```

### 2. React Hook for Authentication

```javascript
// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import apiService from '../services/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved tokens
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      // TODO: can add request to get user info
      setUser({ authenticated: true });
    }
    setIsLoading(false);
  }, []);

  const login = () => {
    apiService.initiateGoogleAuth();
  };

  const logout = async () => {
    await apiService.logout();
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout
  };
}
```

### 3. Handle OAuth Callback

After Google authorization, you need to handle the callback and save tokens:

```javascript
// In your routing or useEffect
useEffect(() => {
  // Check URL for tokens (depends on your implementation)
  const urlParams = new URLSearchParams(window.location.search);
  const tokens = urlParams.get('tokens'); // Depends on your implementation
  
  if (tokens) {
    const { accessToken, refreshToken } = JSON.parse(tokens);
    apiService.setTokens(accessToken, refreshToken);
    // Clear URL and redirect to home
    window.history.replaceState({}, document.title, '/');
  }
}, []);
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