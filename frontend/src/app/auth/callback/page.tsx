"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { parseUserFromUrl } from '@/utils/auth';

export default function CallbackPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const handleCallback = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const userParam = urlParams.get('user');

        if (!userParam) {
          console.error('No user data found in URL');
          router.push('/signup?error=no_user');
          return;
        }

        // Parse user data from URL
        const userData = parseUserFromUrl(userParam);
        
        if (!userData) {
          console.error('Invalid user data');
          router.push('/signup?error=invalid_user');
          return;
        }

        // Set user in store (tokens are automatically in httpOnly cookies)
        setUser(userData);
        
        console.log('Authentication successful:', userData);
        
        // Redirect to test page
        router.push('/test');
        
      } catch (error) {
        console.error('Callback processing error:', error);
        router.push('/signup?error=auth_failed');
      }
    };

    handleCallback();
  }, [router, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-nice mx-auto mb-4"></div>
        <p>Completing login...</p>
      </div>
    </div>
  );
}