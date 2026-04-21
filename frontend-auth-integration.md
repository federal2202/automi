# Frontend Google Auth Integration Guide

## Overview
This guide shows how to integrate the backend Google OAuth flow into your frontend application.

## Backend Endpoints Available

```
GET  /auth/google                    - Initiate Google OAuth
GET  /auth/google/callback          - OAuth callback (handled by backend)
POST /auth/refresh                  - Refresh JWT token
POST /auth/logout                   - Logout user
GET  /calendar                      - Get user's calendars (requires auth)
GET  /calendar/:calendarId/events   - Get calendar events (requires auth)
```

## Frontend Integration Steps

### 1. Login Button Component

```jsx
// components/LoginButton.jsx
import { useState } from 'react';

const LoginButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Redirect to backend OAuth endpoint
    window.location.href = 'http://localhost:8000/auth/google';
  };

  return (
    <button 
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      {isLoading ? 'Redirecting...' : 'Sign in with Google'}
    </button>
  );
};

export default LoginButton;
```

### 2. Auth Context/Store

```jsx
// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwt_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Check for auth callback on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('token');
    const userData = urlParams.get('user');
    
    if (authToken && userData) {
      // Successfully authenticated
      setToken(authToken);
      setUser(JSON.parse(decodeURIComponent(userData)));
      localStorage.setItem('jwt_token', authToken);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    setIsLoading(false);
  }, []);

  const logout = async () => {
    try {
      await fetch('http://localhost:8000/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('jwt_token');
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 3. Protected Route Component

```jsx
// components/ProtectedRoute.jsx
import { useAuth } from '../context/AuthContext';
import LoginButton from './LoginButton';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl mb-4">Please sign in to continue</h1>
        <LoginButton />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
```

### 4. Calendar Component Example

```jsx
// components/Calendar.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Calendar = () => {
  const { token } = useAuth();
  const [calendars, setCalendars] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState('');

  // Fetch user's calendars
  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        const response = await fetch('http://localhost:8000/calendar', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setCalendars(data);
      } catch (error) {
        console.error('Error fetching calendars:', error);
      }
    };

    if (token) {
      fetchCalendars();
    }
  }, [token]);

  // Fetch events for selected calendar
  const fetchEvents = async (calendarId) => {
    try {
      const response = await fetch(`http://localhost:8000/calendar/${calendarId}/events`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Your Calendars</h2>
      
      <select 
        value={selectedCalendar} 
        onChange={(e) => {
          setSelectedCalendar(e.target.value);
          if (e.target.value) {
            fetchEvents(e.target.value);
          }
        }}
        className="mb-4 p-2 border rounded"
      >
        <option value="">Select a calendar</option>
        {calendars.map(calendar => (
          <option key={calendar.id} value={calendar.id}>
            {calendar.summary}
          </option>
        ))}
      </select>

      {events.length > 0 && (
        <div>
          <h3 className="text-lg mb-2">Events</h3>
          {events.map(event => (
            <div key={event.id} className="border p-2 mb-2 rounded">
              <h4 className="font-bold">{event.summary}</h4>
              <p>{new Date(event.start.dateTime).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Calendar;
```

### 5. Main App Structure

```jsx
// App.jsx
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Calendar from './components/Calendar';
import { useAuth } from './context/AuthContext';

const AppContent = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">NotebookLM Calendar</h1>
          {user && (
            <div className="flex items-center gap-4">
              <span>Welcome, {user.name}</span>
              <button 
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      
      <main className="container mx-auto p-4">
        <ProtectedRoute>
          <Calendar />
        </ProtectedRoute>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
```

### 6. Token Refresh Utility

```jsx
// utils/api.js
export const refreshToken = async () => {
  const token = localStorage.getItem('jwt_token');
  
  try {
    const response = await fetch('http://localhost:8000/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('jwt_token', data.token);
      return data.token;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    localStorage.removeItem('jwt_token');
    window.location.reload();
  }
};

// HTTP client with auto token refresh
export const apiClient = async (url, options = {}) => {
  let token = localStorage.getItem('jwt_token');
  
  const makeRequest = async (authToken) => {
    return fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  };
  
  let response = await makeRequest(token);
  
  // If token expired, try to refresh
  if (response.status === 401) {
    const newToken = await refreshToken();
    if (newToken) {
      response = await makeRequest(newToken);
    }
  }
  
  return response;
};
```

## Key Points

1. **OAuth Flow**: User clicks login → redirected to Google → redirected back to your app with token
2. **Token Storage**: JWT token stored in localStorage for subsequent API calls
3. **Protected Routes**: Wrap sensitive components with authentication checks
4. **API Calls**: Include Authorization header with Bearer token
5. **Token Refresh**: Automatically refresh expired tokens
6. **Error Handling**: Handle auth errors gracefully

## Environment Variables

```env
# Frontend .env
REACT_APP_API_URL=http://localhost:8000
```

This integration provides a complete authentication flow with your Google OAuth backend.