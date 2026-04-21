import { User } from '@/types/User';

/**
 * Authentication utility functions
 * Tokens are now managed via httpOnly cookies set by backend
 */

export function parseUserFromUrl(userParam: string): User | null {
  try {
    const userData = JSON.parse(decodeURIComponent(userParam));
    if (userData.id && userData.email && userData.name) {
      return userData as User;
    }
    return null;
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
}