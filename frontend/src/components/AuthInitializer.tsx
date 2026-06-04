"use client";

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks'
import { checkAuth, syncDeviceTimezone } from '@/stores/authSlice'

/**
 * App-boot side-effects:
 *   1. Hydrate auth state from the session cookie (`checkAuth`).
 *   2. Once the user is loaded, silently push the device's IANA timezone
 *      to `/me/timezone` if it diverged from the server-stored value.
 *      This keeps recurring-activity → Google Calendar event generation
 *      anchored to the user's actual locale without surfacing UI.
 */
export function AuthInitializer() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);
  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch]);

  useEffect(() => {
    if (!isInitialized || !user) return;
    void dispatch(syncDeviceTimezone());
    // We intentionally only re-run when the user id flips or initialization
    // completes — not on every user object mutation, to avoid loops when
    // `syncDeviceTimezone` itself updates the user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, user?.id, dispatch]);

  return null;
}
