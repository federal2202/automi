/**
 * Calendar composite hooks barrel.
 *
 * Thin wrappers over the Redux `calendar` slice that preserve the EXACT return
 * shapes of the original Zustand-derived hooks, so consumers migrate by
 * changing only their import path. Each hook lives in its own file (SRP).
 *
 * `useEventManagement` and `useCalendarWithEvents` mix this Redux UI state with
 * TanStack Query mutations/data — that logic is ported verbatim, only swapping
 * Zustand reads for `useAppSelector` and setters for `dispatch(...)`.
 */
export { useCalendarState } from './useCalendarState'
export { useCalendarUIState } from './useCalendarUIState'
export { useCalendarActions } from './useCalendarActions'
export { useCalendarNavigation } from './useCalendarNavigation'
export { useEventManagement } from './useEventManagement'
export { useCalendarWithEvents } from './useCalendarWithEvents'
