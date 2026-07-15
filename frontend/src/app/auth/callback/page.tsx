"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/stores/hooks';
import { setUser } from '@/stores/authSlice';
import { parseUserFromUrl } from '@/utils/auth';
import { FullScreenLoader } from '@/components/shared/Loader';
import { getPeriods } from '@/services/periods.service';

export default function CallbackPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get('error');

        if (errorParam) {
          console.error('OAuth callback error:', errorParam);
          router.push(`/signup?error=${errorParam}`);
          return;
        }

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
        dispatch(setUser(userData));

        console.log('Authentication successful:', userData);

        // Derive onboarding status from data: a user is "onboarded" the
        // moment they have ≥1 Period. We hit `/periods` directly here
        // (rather than waiting for the dashboard guard) so brand-new users
        // never flash the dashboard before being routed to the wizard.
        // On failure we fall back to the dashboard — the guard there will
        // also retry; we don't want a transient API blip to strand the user.
        try {
          const periods = await getPeriods();
          if (!periods || periods.length === 0) {
            router.replace('/onboarding');
            return;
          }
        } catch (err) {
          console.warn('Failed to check periods during auth callback', err);
        }

        // Redirect to dashboard page
        router.replace('/dashboard/calendar');

      } catch (error) {
        console.error('Callback processing error:', error);
        router.push('/signup?error=auth_failed');
      }
    };

    void handleCallback();
  }, [router, dispatch]);

  return <FullScreenLoader intense label="COMPLETING LOGIN // AUTH PROTOCOL" />;
}