/**
 * Calendar composite hooks — barrel re-export.
 *
 * The hooks now live one-per-file under `stores/calendar/`. This module is kept
 * as a stable import path (`@/stores/calendarHooks`) for existing consumers and
 * simply re-exports the folder barrel.
 */
export {
  useCalendarState,
  useCalendarUIState,
  useCalendarActions,
  useCalendarNavigation,
  useEventManagement,
  useCalendarWithEvents,
} from './calendar'
