# Zustand → Redux Toolkit Migration

Status as of commit `09d5c2b`. This document is the source of truth for the
migration. Agents picking up the work should update the checklists and commit
the doc alongside their changes.

## Goal

Replace **Zustand** with **Redux Toolkit + React Redux** as the global client
state library for the `frontend/` Next.js app. TanStack Query stays — it owns
server cache (Google Calendar events, periods, etc.). Redux owns UI state and
session (auth user, calendar view state).

The migration is being done **incrementally**: both libraries coexist while
files are being converted, and Zustand is only removed once every consumer is
on RTK.

---

## Architecture (target)

```
frontend/src/stores/
├── index.ts          # configureStore + RootState / AppDispatch types
├── hooks.ts          # typed useAppDispatch / useAppSelector
├── authSlice.ts      # auth state + checkAuth/syncDeviceTimezone thunks
└── calendarSlice.ts  # (TODO) UI-only calendar state — events stay in TanStack Query
```

The folder is intentionally named `stores/` (legacy from Zustand). One Redux
store, multiple slices inside.

`ReduxProvider` is a thin `'use client'` wrapper at
`frontend/src/components/providers/ReduxProvider.tsx`. It is mounted in
`frontend/src/app/layout.tsx` **outside** `QueryProvider` so that
`AuthInitializer` (which dispatches thunks) can run.

### Conventions

- **Selectors:** one selector returns one primitive. NEVER destructure a slice
  in `useAppSelector` — it returns a new object reference each render and
  causes wasted re-renders:
  ```ts
  // ❌ bad
  const { user, isAuthenticated } = useAppSelector(s => s.auth)
  // ✅ good
  const user = useAppSelector(s => s.auth.user)
  const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated)
  ```
- **Dispatch:** `useAppDispatch()` from `@/stores/hooks`. Action creators and
  thunks are imported from the slice file.
- **Async:** use `createAsyncThunk`. Handle `pending`/`fulfilled`/`rejected`
  in `extraReducers` — but only the cases that change UI-visible state.
- **State shape (`RootState`):**
  - `state.auth` — `AuthState` (done)
  - `state.calendar` — `CalendarState` (pending; reducer currently commented
    out in `stores/index.ts`)
- **State for `getState` typing inside thunks:** inline the slice shape (e.g.
  `{ state: { auth: AuthState } }`) to avoid the `slice ↔ store/index.ts`
  circular import.

---

## What's done

### Infrastructure

- [x] Installed `@reduxjs/toolkit` and `react-redux` in `frontend/`
- [x] Created `stores/index.ts` (configureStore, `RootState`, `AppDispatch`)
- [x] Created `stores/hooks.ts` (`useAppDispatch`, `useAppSelector`)
- [x] Created `components/providers/ReduxProvider.tsx`
- [x] Mounted `<ReduxProvider>` in `app/layout.tsx` (outside `QueryProvider`)
- [x] Added root `.gitignore` to prevent stray root-level `node_modules` /
      `package.json` from being committed

### Auth slice

- [x] `stores/authSlice.ts` created
  - State: `user`, `isAuthenticated`, `isLoading`, `isInitialized`
  - Reducers: `setUser`, `setIsAuthenticated`, `logout`
  - Thunks: `checkAuth`, `syncDeviceTimezone`
  - `extraReducers` cover `checkAuth.pending/fulfilled/rejected` and
    `syncDeviceTimezone.fulfilled` (silent operation — pending/rejected
    intentionally skipped)

### Components migrated from `useAuthStore` → Redux

- [x] `app/auth/callback/page.tsx` (dispatches `setUser`)
- [x] `app/layout.tsx` (Provider mounting)
- [x] `components/Navigation.tsx` (reads `isAuthenticated`)
- [x] `components/AuthInitializer.tsx` (dispatches `checkAuth`,
      `syncDeviceTimezone`)
- [x] `components/onboarding/OnboardingWizard.tsx` (reads `user`, dispatches
      `setUser`)

---

## What's left

### Phase A — Finish auth migration

Remaining files importing `useAuthStore`. Pattern is identical to the migrated
ones above. All read-only or simple dispatch.

- [x] `app/test/page.tsx` — reads `state.user`. Replace with
      `useAppSelector(s => s.auth.user)`.
- [x] `app/(dashboard)/dashboard/calendar/page.tsx` — reads
      `isAuthenticated`, `isLoading`, `isInitialized`. **Three separate**
      `useAppSelector` calls (one per primitive).
- [x] `components/ui/app-sidebar.tsx` — reads `user`, `isAuthenticated`. Two
      separate selectors.
- [x] `components/onboarding/OnboardingGuard.tsx` — reads `isInitialized`,
      `user`. Two separate selectors.

After this phase: **delete `stores/authStore.ts`** and remove its export from
`stores/index.ts` if any.

### Phase B — Calendar slice

`stores/calendarStore.ts` is a Zustand store with **only synchronous UI
state** (no async, no API calls — events live in TanStack Query). This makes
it simpler than auth: no `createAsyncThunk` needed, just `reducers`.

#### 1. Create `stores/calendarSlice.ts`

State (port these fields exactly — many components read them):

```ts
{
  currentDate: Date
  view: CalendarView
  selectedCalendarId: string  // default 'primary'
  isEventModalOpen: boolean
  selectedEventId: string | null
  selectedSlot: { start: Date; end: Date } | null
  isLoading: boolean
  error: CalendarApiError | null
}
```

Note: state holds raw `Date` objects. Redux Toolkit's
`serializableStateInvariantMiddleware` will warn about this. Two options:
1. Disable the check for these paths via `configureStore({ middleware: ... })`
   — preferred to keep parity with current code.
2. Store ISO strings instead and convert at use sites — bigger refactor, defer.

Pick option 1 for now and document.

Reducers to implement (1:1 with the current Zustand store):

- `setCurrentDate(date)`
- `setView(view)`
- `setSelectedCalendar(calendarId)`
- `navigateCalendar(direction)` — needs `state.currentDate` and `state.view`,
  computes new date via `navigateCalendarDate(...)` from
  `@/utils/calendar/dateUtils`. Reducers can read state directly, no thunk
  needed.
- `openCreateModal(slot)` — sets `isEventModalOpen=true`, `selectedSlot`,
  clears `selectedEventId` and `error`
- `openEditModal(eventId)` — sets `isEventModalOpen=true`, `selectedEventId`,
  clears `selectedSlot` and `error`
- `closeModal()` — clears modal fields
- `selectEvent(eventId | null)`
- `setLoading(boolean)`
- `setError(error | null)`
- `clearError()`

Export `calendarReducer`. Add it to `stores/index.ts` (currently commented
out).

#### 2. Replace the Zustand-derived hooks

`stores/calendarStore.ts` exports several composite hooks that components use
heavily. Recreate them as thin wrappers in a new file, e.g.
`stores/calendarHooks.ts` (or co-locate in the slice file), so consumers can
migrate with minimal changes:

- `useCalendarState()` — `{ currentDate, view, selectedCalendarId }`
- `useCalendarUIState()` — `{ isEventModalOpen, isCreateMode, selectedEventId, selectedSlot, isLoading, error }`
  - `isCreateMode` is derived: `selectedSlot !== null`
- `useCalendarActions()` — returns object of bound action creators. With
  Redux, the cleanest way is:
  ```ts
  export const useCalendarActions = () => {
    const dispatch = useAppDispatch()
    return useMemo(() => ({
      setCurrentDate: (d: Date) => dispatch(setCurrentDate(d)),
      // ...etc
    }), [dispatch])
  }
  ```
- `useCalendarNavigation()` — composes state + actions, identical shape
- `useEventManagement()` — the complex one. It mixes Redux UI state with
  TanStack Query mutations (`useCreateGoogleCalendarEvent`, etc). Port the
  logic verbatim, only swap the Zustand reads for `useAppSelector` and the
  setters for `dispatch(...)`. Keep the `selectedEvent` `useMemo` that scans
  TanStack Query caches.
- `useCalendarWithEvents(events)` — same idea, port verbatim.

#### 3. Migrate consumers from `useCalendarStore` & friends

These files import from `@/stores/calendarStore` or from
`@/hooks/calendar/useCalendarState`. Update their imports to the new module:

- [x] `components/calendar/Calendar.tsx`
- [x] `components/calendar/CalendarGrid.tsx`
- [x] `components/calendar/EventForm.tsx`
- [x] `components/calendar/EventModal.tsx`
- [x] `components/calendar/DeleteConfirmationDialog.tsx`
- [x] `components/calendar/GoogleCalendarProvider.tsx`
- [x] `components/calendar/index.ts` (barrel — just re-exports)
- [x] `hooks/calendar/useCalendarState.ts` — DELETED. It was a dead, orphaned
      legacy Zustand store (its own `events` array + simulated CRUD) with zero
      importers, distinct from the live `stores/calendarStore.ts`. Composite
      hooks now live in `stores/calendarHooks.ts`.
- [x] `hooks/calendar/useCalendarWithGoogle.ts` — re-pointed to
      `@/stores/calendarHooks`.

After this phase: **delete `stores/calendarStore.ts`** and uncomment
`calendar: calendarReducer` in `stores/index.ts`.

### Phase C — Cleanup

- [x] Remove `zustand` from `frontend/package.json` (`pnpm remove zustand`)
- [x] Re-run `pnpm tsc --noEmit` — passes clean (exit 0)
- [x] Re-run `pnpm lint` — migration-owned errors fixed (the 4 `catch (err: any)`
      blocks ported into `stores/calendarHooks.ts` now narrow `unknown`). The 5
      remaining lint errors are **pre-existing and unrelated to the migration**
      (`EventForm.tsx`, `QueryProvider.tsx`, `textarea.tsx`, `use-mobile.ts`,
      `calendar.service.ts` — all last touched before the migration began) and
      were intentionally left untouched per scope.
- [ ] Smoke-test in browser: **REQUIRES MANUAL BROWSER TESTING by a human — not
      done by the agent.**
  - Auth: log in, log out, refresh while logged in, refresh while logged out
  - Calendar: open modal (create + edit), navigate dates, switch views,
    create/update/delete event, drag-and-drop move
- [x] Update / remove `frontend/CLAUDE.md` mention of Zustand under "State
      Management" — replace with "Redux Toolkit (RTK) for global client
      state; TanStack Query for server cache."

---

## Common pitfalls observed during this migration

1. **Installing deps at repo root by accident.** Always run `pnpm add` from
   inside `frontend/`. Root `.gitignore` now blocks root `node_modules` /
   `package.json` from being committed, but the install itself should still
   land in the right place.
2. **Destructuring `useAppSelector(s => s.slice)`** — re-renders on every
   action. Always select primitives.
3. **Putting `extraReducers` outside `createSlice`** — it's a key on the
   config object, not a top-level statement.
4. **Forgetting `checkAuth.rejected`** — if `pending` flips `isLoading=true`
   and `rejected` is missing, the app hangs on a spinner forever. Rule of
   thumb: every `pending` mutation must have a matching `rejected` reset.
5. **`void dispatch(thunk())` vs bare `dispatch(thunk())`** — both work at
   runtime; `void` only silences ESLint's "Promise must be handled" rule.
   Be consistent within a file.
6. **`dispatch` in `useEffect` deps** — `dispatch` is a stable reference
   (Redux guarantees), so it never causes re-runs. Include it to satisfy
   `react-hooks/exhaustive-deps`.
7. **`Date` objects in Redux state** — triggers the serializable middleware
   warning. Decide explicitly: disable the check for those paths, or move to
   ISO strings. Document the decision in the slice file.

---

## Reference: full file map

### New files created

- `frontend/src/stores/index.ts`
- `frontend/src/stores/hooks.ts`
- `frontend/src/stores/authSlice.ts`
- `frontend/src/stores/calendarSlice.ts`
- `frontend/src/stores/calendarHooks.ts` — composite hooks
- `frontend/src/components/providers/ReduxProvider.tsx`
- `.gitignore` (root)

### Deleted (all consumers migrated)

- `frontend/src/stores/authStore.ts`
- `frontend/src/stores/calendarStore.ts`
- `frontend/src/hooks/calendar/useCalendarState.ts` (dead orphaned legacy store,
  zero importers — its job is fully covered by the new hooks)
