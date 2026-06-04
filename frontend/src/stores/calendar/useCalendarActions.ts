'use client'

import { useMemo } from 'react'

import type { CalendarView, NavigationDirection } from '@/types/calendar/calendar.types'

import { useAppDispatch } from '../hooks'
import type { CalendarApiError } from '../calendarSlice'
import {
  setCurrentDate,
  setView,
  setSelectedCalendar,
  navigateCalendar,
  openCreateModal,
  openEditModal,
  closeModal,
  selectEvent,
  setLoading,
  setError,
} from '../calendarSlice'

/**
 * Hook to access calendar actions (bound action creators).
 */
export const useCalendarActions = () => {
  const dispatch = useAppDispatch()
  return useMemo(
    () => ({
      setCurrentDate: (date: Date) => dispatch(setCurrentDate(date)),
      setView: (view: CalendarView) => dispatch(setView(view)),
      setSelectedCalendar: (calendarId: string) =>
        dispatch(setSelectedCalendar(calendarId)),
      navigateCalendar: (direction: NavigationDirection) =>
        dispatch(navigateCalendar(direction)),

      // UI actions
      openCreateModal: (slot: { start: Date; end: Date }) =>
        dispatch(openCreateModal(slot)),
      openEditModal: (eventId: string) => dispatch(openEditModal(eventId)),
      closeModal: () => dispatch(closeModal()),
      selectEvent: (eventId: string | null) => dispatch(selectEvent(eventId)),
      setLoading: (loading: boolean) => dispatch(setLoading(loading)),
      setError: (error: CalendarApiError | null) => dispatch(setError(error)),
    }),
    [dispatch]
  )
}
