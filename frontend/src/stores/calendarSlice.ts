/**
 * Calendar slice — UI-only calendar state.
 *
 * Events themselves live in TanStack Query (server cache). This slice owns the
 * synchronous UI state that used to live in the Zustand `calendarStore`:
 * current date/view, the selected calendar, modal state, and transient
 * loading/error flags.
 *
 * State shape and types live in `calendar/calendarSlice.types.ts`.
 *
 * DATE-IN-STATE DECISION (doc Phase B, Option 1):
 * We keep raw `Date` objects in state (`currentDate`, `selectedSlot.start/end`)
 * to preserve parity with the previous Zustand store and avoid a wider refactor
 * of every consumer. Raw `Date`s are non-serializable, so Redux Toolkit's
 * `serializableStateInvariantMiddleware` would warn about them. We disable the
 * serializable check ONLY for the affected calendar paths/actions in
 * `stores/index.ts` (see the `ignoredPaths` / `ignoredActions` config there) —
 * the check stays enabled globally for every other slice.
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { CalendarView, NavigationDirection } from '@/types/calendar/calendar.types'
import { navigateCalendarDate } from '@/utils/calendar/dateUtils'

import {
  type CalendarApiError,
  type CalendarState,
  initialCalendarState,
} from './calendar/calendarSlice.types'

export type { CalendarApiError, CalendarState }

const calendarSlice = createSlice({
  name: 'calendar',
  initialState: initialCalendarState,
  reducers: {
    setCurrentDate(state, action: PayloadAction<Date>) {
      state.currentDate = action.payload
    },
    setView(state, action: PayloadAction<CalendarView>) {
      state.view = action.payload
    },
    setSelectedCalendar(state, action: PayloadAction<string>) {
      state.selectedCalendarId = action.payload
    },
    navigateCalendar(state, action: PayloadAction<NavigationDirection>) {
      state.currentDate = navigateCalendarDate(
        state.currentDate,
        state.view,
        action.payload
      )
    },
    openCreateModal(
      state,
      action: PayloadAction<{ start: Date; end: Date }>
    ) {
      state.isEventModalOpen = true
      state.selectedSlot = action.payload
      state.selectedEventId = null
      state.error = null
    },
    openEditModal(state, action: PayloadAction<string>) {
      state.isEventModalOpen = true
      state.selectedEventId = action.payload
      state.selectedSlot = null
      state.error = null
    },
    closeModal(state) {
      state.isEventModalOpen = false
      state.selectedEventId = null
      state.selectedSlot = null
      state.error = null
    },
    selectEvent(state, action: PayloadAction<string | null>) {
      state.selectedEventId = action.payload
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
    setError(state, action: PayloadAction<CalendarApiError | null>) {
      state.error = action.payload
    },
    clearError(state) {
      state.error = null
    },
  },
})

export const {
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
  clearError,
} = calendarSlice.actions

export const calendarReducer = calendarSlice.reducer
