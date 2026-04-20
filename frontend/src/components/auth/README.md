# Authentication Components

Phase 2 of the authentication system - UI components and OAuth callback handling.

## Components Overview

### LoginButton
Google OAuth login button with loading states and error handling.

**Props:**
- `onSuccess?: () => void` - Called after successful login
- `onError?: (error: string) => void` - Called on login error
- `className?: string` - Additional CSS classes
- `size?: 'small' | 'large'` - Button size (default: 'large')
- `variant?: 'primary' | 'secondary'` - Button style (default: 'primary')
- `redirectTo?: string` - Where to redirect after login (default: '/dashboard')

**Usage:**
```tsx
import { LoginButton } from '@/components/auth'

<LoginButton
  onSuccess={() => console.log('Login successful!')}
  onError={(error) => console.error('Login failed:', error)}
  redirectTo="/dashboard"
/>
```

### LogoutButton
Logout functionality with optional confirmation dialog.

**Props:**
- `onSuccess?: () => void` - Called after successful logout
- `onError?: (error: string) => void` - Called on logout error
- `className?: string` - Additional CSS classes
- `size?: 'small' | 'large'` - Button size (default: 'small')
- `variant?: 'primary' | 'secondary' | 'ghost'` - Button style (default: 'ghost')
- `showConfirmation?: boolean` - Show confirmation dialog (default: false)
- `redirectTo?: string` - Where to redirect after logout (default: '/')
- `children?: React.ReactNode` - Custom button content

**Usage:**
```tsx
import { LogoutButton } from '@/components/auth'

<LogoutButton
  variant="ghost"
  showConfirmation
  onSuccess={() => console.log('Logged out')}
>
  Sign Out
</LogoutButton>
```

### UserProfile
Display authenticated user information with optional dropdown menu.

**Props:**
- `className?: string` - Additional CSS classes
- `variant?: 'dropdown' | 'inline' | 'minimal'` - Display style (default: 'dropdown')
- `showDetails?: boolean` - Show email and other details (default: true)
- `onSettingsClick?: () => void` - Settings button handler

**Usage:**
```tsx
import { UserProfile } from '@/components/auth'

// Dropdown version (for navigation/sidebar)
<UserProfile
  variant="dropdown"
  onSettingsClick={() => router.push('/settings')}
/>

// Inline version (for headers)
<UserProfile variant="inline" />

// Minimal version (just avatar)
<UserProfile variant="minimal" />
```

## Integration Examples

### 1. Navigation Integration
Replace the current "Get Started" button with dynamic auth state:

```tsx
// src/components/Navigation.tsx
'use client'

import Link from 'next/link'
import Button from './shared/Button'
import Logo from './shared/Logo'
import { LoginButton, UserProfile } from './auth'
import { useAuthState } from '@/hooks/useAuth'

export default function Navigation() {
  const { isAuthenticated } = useAuthState()

  return (
    <nav className='w-full max-w-[600px] h-[50px] flex items-center justify-between px-3 lg:px-4 py-3 bg-[#ffffff]/2 border-[1px] mt-4 mx-4 md:mx-0 border-[#ffffff]/10 rounded-[30px] animate-fade-in-down backdrop-blur-sm'>
      {/* ... existing nav items ... */}
      
      <div className='animate-slide-in-right'>
        {isAuthenticated ? (
          <UserProfile variant="inline" />
        ) : (
          <LoginButton size="small" variant="primary" />
        )}
      </div>
    </nav>
  )
}
```

### 2. Sidebar Integration
Replace the hardcoded user profile in the sidebar:

```tsx
// src/components/ui/app-sidebar.tsx
import { UserProfile } from '../auth'

// Replace the SidebarFooter content:
<SidebarFooter className="p-4 border-t border-sidebar-border/50">
  <UserProfile
    variant="dropdown"
    onSettingsClick={() => router.push('/dashboard/settings')}
  />
</SidebarFooter>
```

### 3. Landing Page Integration
Add login button to hero section:

```tsx
// src/components/landing/HeroSection.tsx
import { LoginButton } from '@/components/auth'
import { useAuthState } from '@/hooks/useAuth'

export default function HeroSection() {
  const { isAuthenticated } = useAuthState()

  return (
    <section>
      {/* ... hero content ... */}
      
      <div className="flex gap-4">
        {isAuthenticated ? (
          <Button 
            text="Go to Dashboard" 
            onClick={() => router.push('/dashboard')}
            type="primary" 
            size="large" 
          />
        ) : (
          <LoginButton size="large" variant="primary" />
        )}
      </div>
    </section>
  )
}
```

## OAuth Callback Page

The callback handler at `/auth/callback` automatically:

1. Extracts authorization code from URL parameters
2. Calls `loginWithGoogle()` with the code
3. Shows loading, success, or error states
4. Redirects to the intended destination
5. Handles errors gracefully with retry options

## Environment Variables Required

Add to your `.env.local`:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# API Configuration (if different from default)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Error Handling

All components integrate with the `useAuth` hook's error system:
- Automatic error display in components
- Centralized error state management
- User-friendly error messages
- Retry mechanisms where appropriate

## Styling

Components use the project's established patterns:
- Tailwind CSS 4 with CSS variables
- Custom green-nice brand color
- Glassmorphism effects with backdrop-blur
- Consistent animation classes
- Dark theme focused design

## Next Steps

After implementing these components:
1. Update Navigation and sidebar components
2. Add login/logout functionality to landing pages  
3. Implement Phase 3: Route protection
4. Add authentication guards to dashboard routes
5. Create protected route middleware

## Testing Integration

Test the auth flow:
1. Click login button → redirects to Google
2. Complete OAuth → returns to callback page
3. Callback page → shows success and redirects to dashboard
4. User profile → shows user info and logout option
5. Logout → clears state and redirects to home