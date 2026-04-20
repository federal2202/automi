# Backend API Flow Documentation

## Architecture Overview
Your backend is a Node.js Express server with Google OAuth authentication and Google Calendar integration.

### Tech Stack
- **Express.js** - Web framework
- **Prisma** - Database ORM (PostgreSQL via Supabase)
- **Google APIs** - OAuth & Calendar integration
- **JWT** - Session management
- **TypeScript** - Type safety

### Database Schema
Single `User` model storing:
- Basic info (googleId, email, name, picture)
- Google OAuth tokens (accessToken, refreshToken, expiresAt, scope)

## API Endpoints

### 1. Health & Testing (No Auth Required)

#### Health Check
```
GET /health
Response: { "status": "ok" }
```

#### Hello World (Testing)
```
GET /hello
Response: { "message": "Hello, world!" }
```

### 2. Authentication Flow

#### Start OAuth Flow
```
GET /auth/google
→ Redirects user to Google OAuth consent screen
→ User grants calendar permissions
→ Google redirects to /auth/callback
```

#### OAuth Callback
```
GET /auth/callback?code=<authorization_code>
→ Exchanges authorization code for Google tokens
→ Creates or updates user in database
→ Returns JWT tokens + user info

Response:
{
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token", 
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "profile_pic_url"
  }
}
```

#### Refresh JWT Tokens
```
POST /auth/refresh
Headers: Content-Type: application/json
Body: { "refreshToken": "your_refresh_token" }

Response:
{
  "accessToken": "new_jwt_access_token",
  "refreshToken": "new_jwt_refresh_token"
}
```

#### Logout
```
POST /auth/logout
Response: { "message": "Logged out successfully" }
Note: JWT blacklisting not implemented
```

### 3. Calendar Endpoints (All Require JWT Auth)

All calendar endpoints require `Authorization: Bearer <accessToken>` header.

#### List User's Calendars
```
GET /calendar/calendars
Headers: Authorization: Bearer <jwt_access_token>

Response: Google Calendar API format
{
  "items": [
    {
      "id": "calendar_id",
      "summary": "Calendar Name",
      ...
    }
  ]
}
```

#### Get Calendar Events
```
GET /calendar/events?calendarId=primary&timeMin=2024-01-01T00:00:00Z&timeMax=2024-12-31T23:59:59Z
Headers: Authorization: Bearer <jwt_access_token>

Query Parameters:
- calendarId: Calendar ID (default: 'primary')
- timeMin: Start time (ISO 8601)
- timeMax: End time (ISO 8601)

Response: Google Calendar API format
{
  "items": [
    {
      "id": "event_id",
      "summary": "Event Title",
      "start": { "dateTime": "2024-01-01T10:00:00Z" },
      "end": { "dateTime": "2024-01-01T11:00:00Z" },
      ...
    }
  ]
}
```

## Client Integration Flow

### Recommended Authentication Flow

1. **Health Check**
   ```
   GET http://localhost:8000/health
   ```

2. **Test Backend**
   ```
   GET http://localhost:8000/hello
   ```

3. **Start OAuth** (Redirect user's browser)
   ```
   GET http://localhost:8000/auth/google
   ```

4. **Handle OAuth Callback**
   - User gets redirected to `/auth/callback` after Google consent
   - Extract JWT tokens from response
   - Store `accessToken` and `refreshToken` securely

5. **Make Authenticated Requests**
   - Include `Authorization: Bearer <accessToken>` in all calendar API calls
   - Handle 401 responses by refreshing tokens

6. **Token Refresh**
   ```
   POST http://localhost:8000/auth/refresh
   Body: { "refreshToken": "stored_refresh_token" }
   ```

### Postman Testing Sequence

1. **Basic Tests**
   ```
   GET http://localhost:8000/health
   GET http://localhost:8000/hello
   ```

2. **OAuth Flow** (Browser Required)
   ```
   GET http://localhost:8000/auth/google
   → Copy the redirect URL and open in browser
   → Complete Google OAuth flow
   → Extract tokens from final callback response
   ```

3. **Calendar APIs** (Use JWT from OAuth)
   ```
   GET http://localhost:8000/calendar/calendars
   Headers: Authorization: Bearer <your_jwt_token>
   
   GET http://localhost:8000/calendar/events?calendarId=primary
   Headers: Authorization: Bearer <your_jwt_token>
   ```

4. **Token Management**
   ```
   POST http://localhost:8000/auth/refresh
   Headers: Content-Type: application/json
   Body: { "refreshToken": "your_refresh_token" }
   ```

## Environment Variables

Required environment variables in `.env`:
- `PORT` - Server port (default: 8000)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token signing secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_REDIRECT_URI` - OAuth redirect URI
- `FRONTEND_URL` - Frontend URL for CORS

## Error Handling

- **401 Unauthorized** - Invalid or expired JWT token
- **403 Forbidden** - Invalid refresh token
- **500 Internal Server Error** - Google API errors or database issues

## Security Notes

- Google OAuth tokens are stored in database
- JWT tokens are used for session management
- CORS configured for frontend communication
- Helmet.js provides security headers
- Rate limiting not implemented (consider adding)