import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from './authSlice'
import { calendarReducer } from './calendarSlice'



export const store = configureStore({
  reducer: {
    auth: authReducer,
    calendar: calendarReducer,
  },
  // The calendar slice intentionally stores raw `Date` objects (see the
  // date-in-state decision documented in `calendarSlice.ts`). Disable the
  // serializable-state check ONLY for those calendar paths/actions; it stays
  // enabled globally for every other slice.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['calendar/setCurrentDate', 'calendar/openCreateModal'],
        ignoredPaths: [
          'calendar.currentDate',
          'calendar.selectedSlot.start',
          'calendar.selectedSlot.end',
        ],
      },
    }),
})


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
