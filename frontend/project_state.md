# NotebookLM Project State Documentation

> **State map regenerated 2026-06-04** by sweeping the live `frontend/src` tree (4 parallel explore agents: data/state layer, routes, components, types/utils/config/build). The dated changelog below is preserved as history; the reference sections after it (Architecture → Build Health) describe the **current** codebase. Note: the old "Zustand `calendarStore.ts`" sections were removed — that store no longer exists, calendar UI state now lives in a Redux Toolkit slice.

**Tasks feature — Execution Queue (after 2026-05-15)** — New `/dashboard/tasks` route renders a task list ("Execution Queue"). `services/tasks.service.ts` (`tasksService`) calls `GET /tasks`, `GET /tasks/{id}`, `PATCH /tasks/{id}/done`. `types/task.ts` defines `Task`, `Step`, `Resource`. Components: `tasks/TaskCard.tsx`, `TaskList.tsx`, `TaskDetailDialog.tsx`, decomposed `tasks/task-detail/` sections (description, badges, steps, resources, success criteria, done button). Fetched via TanStack Query.

**Account UI + logout (after 2026-05-15)** — Sidebar footer now has a user block opening an account dialog. New `components/account/`: `SidebarUserButton.tsx`, `AccountDialog.tsx`, `LogoutConfirmDialog.tsx`, `UserAvatar.tsx`. `hooks/auth/useLogout.ts` POSTs `/auth/logout` (best-effort), dispatches Redux `logout()`, routes to `/signup`. New `app/signup/page.tsx` is the Google-OAuth entry page ("Continue with Google" → `http://localhost:8000/auth/google`).

**Server-backed onboarding flag (after 2026-05-15)** — Onboarding completion is now a real server field: `User.onboardingCompletedAt`. `services/onboarding.service.ts` POSTs `/me/onboarding/complete` (idempotent). `OnboardingGuard` redirects to `/onboarding` when that field is null (superseding the earlier "derive from ≥1 period" heuristic). Onboarding wizard decomposed under `components/onboarding/` (WizardChrome, WizardSteps, StepIndicator, `useOnboardingNavigation`) with per-step subfolders `steps/period-step/` and `steps/activity-step/`.

**SOLID refactor COMPLETE (all 13 domains)** — The `<100-line` SOLID decomposition tracked in `SOLID_REFACTOR_PROGRESS.md` is finished across stores, activities, periods, onboarding, calendar (google hooks, utils, services, types, components, hooks), tasks, shared, landing. Parent components keep thin re-export shims (e.g. `calendar/Calendar.tsx` → `calendar/calendar-main/`). A handful of files remain >100 lines as known non-critical review items (calendar-transform utils, calendar.service barrel, google-calendar types, EventForm, CalendarGrid). `pnpm tsc --noEmit` and `pnpm lint` both pass clean as of 2026-06-04.

**3-step onboarding wizard (2026-05-15)** — New onboarding flow at `/onboarding` for first-time users. No backend changes; "onboarded" is derived purely from `GET /periods` (≥1 period). Every step has a "Skip for now" link that exits to `/dashboard/calendar`.
- Steps live in a single route with local `useState` step index (no URL change between steps):
  1. `WelcomeStep` — short explainer for Periods + Activities concepts with examples.
  2. `PeriodStep` — title + start/end date form, reuses the timezone-safe ISO round-trip helpers from `PeriodFormDialog`. On submit POSTs via `createPeriod` and stashes the returned `Period` in wizard state.
  3. `ActivityStep` — title + weekday chips + per-day or shared start/end times (mirrors `RecurringActivityFormDialog`). POSTs via `createActivity` scoped to the period from step 2, then routes to `/dashboard/calendar`.
- Wizard uses React Query mutations and invalidates the same keys as the dashboard pages: `['periods']` and `googleCalendarQueryKeys.events()` on period create; `['period', periodId, 'activities']` and `googleCalendarQueryKeys.events()` on activity create. Surfaces `toastActivityCreate(sync)` so the Google Calendar sync result is visible.
- Submit buttons show spinner + "Syncing to Google Calendar..." copy while pending (matches existing dashboard pattern).
- Glassmorphism card wrapper (`bg-[#ffffff]/2 backdrop-blur-sm`) centered in the viewport; 3-pill step indicator at top of the card.
- Redirect wiring:
  - `src/app/auth/callback/page.tsx` — after `setUser`, awaits `getPeriods()`. Empty list → `router.replace('/onboarding')`; otherwise → `/dashboard/calendar`. Failure is logged + falls through to the dashboard (the dashboard guard retries).
  - `src/components/onboarding/OnboardingGuard.tsx` (new) — mounted in the dashboard layout. Once `isInitialized && user` is truthy, calls `getPeriods()` exactly once (gated by `useRef`); if empty AND we're not already on `/onboarding`, `router.replace('/onboarding')`. Failure is swallowed with `console.warn` so a transient API blip never strands a real user.
- New files: `src/app/onboarding/layout.tsx` (minimal dark layout + its own sonner Toaster — the dashboard one isn't in scope here), `src/app/onboarding/page.tsx`, `src/components/onboarding/OnboardingWizard.tsx`, `src/components/onboarding/OnboardingGuard.tsx`, `src/components/onboarding/steps/WelcomeStep.tsx`, `src/components/onboarding/steps/PeriodStep.tsx`, `src/components/onboarding/steps/ActivityStep.tsx`.
- Modified files: `src/app/auth/callback/page.tsx`, `src/app/(dashboard)/dashboard/layout.tsx`.
- `pnpm tsc --noEmit` clean. `pnpm lint` clean for every changed file (pre-existing warnings in `landing/`, `ui/`, calendar hooks, etc. unchanged).

**Fix — RecurringActivityCard shows only the bucket's day time (2026-05-14)** — Cards rendered inside a day bucket now display only that day's start/end time instead of the full multi-day schedule.
- Files changed:
  - `src/components/activities/RecurringActivityCard.tsx` (added optional `dayContext?: number` prop; when defined, renders a single line with just that weekday's start/end time)
  - `src/app/(dashboard)/dashboard/periods/[id]/page.tsx` (passes `dayContext={dow}` to each `<RecurringActivityCard>` inside the day bucket)

**Per-day schedule (per-weekday start/end times in activity form) (2026-05-14)** — RecurringActivityFormDialog now supports independent start/end times per selected weekday with a "same time for all" convenience toggle.
- Files changed:
  - `src/types/activity.ts` (new `ScheduleEntry` interface; `RecurringActivity` and `CreateActivityInput` replace `daysOfWeek + startTime + endTime` with `schedule: ScheduleEntry[]`)
  - `src/components/activities/RecurringActivityFormDialog.tsx` (rewrote state around `schedule: ScheduleEntry[]` + `sameTimeForAll` toggle; day chips add/remove schedule entries; when toggle is OFF, renders per-day `<input type="time">` rows in Mon→Sun order; validation now per-entry)
  - `src/components/activities/RecurringActivityCard.tsx` (renders single line "Mon, Wed, Fri · 06:00–08:00" when all entries share times, otherwise one line per weekday with its own window)
  - `src/app/(dashboard)/dashboard/periods/[id]/page.tsx` (bucketing iterates `schedule`; per-bucket sort uses each entry's own `startTime` matched to the bucket's weekday)
  - `src/hooks/calendar/useEventGeneration.ts` (`eventGenerationUtils.createEvent`/`createRecurringEvent` now take `schedule: ScheduleEntryInput[]` and parse `HH:mm` per entry for both start and end)
  - `src/utils/activity-sync-toast.ts` (comment updated: `daysOfWeek` → `schedule`)
- `pnpm tsc --noEmit` clean.

**RecurringActivity multi-day support (daysOfWeek array) (2026-05-14)** — Activity form now uses a 7-chip multi-select; types, list, and calendar transforms updated to handle `daysOfWeek` as an int array.
- Files changed:
  - `src/types/activity.ts` (`dayOfWeek: number` → `daysOfWeek: number[]` on `RecurringActivity` and `CreateActivityInput`; doc comments updated)
  - `src/components/activities/RecurringActivityFormDialog.tsx` (replaced `<select>` day picker with a 7-chip multi-select rendered in `WEEK_DISPLAY_ORDER`; default `[1]` for create, `initialActivity.daysOfWeek` on edit; validation requires non-empty array; submits `daysOfWeek`)
  - `src/components/activities/RecurringActivityCard.tsx` (renders comma-separated Mon→Sun day labels under the time row when the activity recurs on >1 day)
  - `src/app/(dashboard)/dashboard/periods/[id]/page.tsx` (bucketing now fans out each activity across every day in its `daysOfWeek`, so a multi-day rule appears in each of its selected day sections)
  - `src/hooks/calendar/useEventGeneration.ts` (`eventGenerationUtils.createEvent` signature: `dayOfWeek: number` → `daysOfWeek: number[]`, returns `CalendarEvent[]`; `createRecurringEvent` delegates to it)
  - `src/utils/activity-sync-toast.ts` (comment updated `dayOfWeek` → `daysOfWeek`)
- `pnpm tsc --noEmit` clean.

**Fix — calendar cache invalidation on activity/period mutations (2026-05-14)** — Mutations on activities and periods now invalidate the `googleCalendarQueryKeys.events()` React Query key so the in-app calendar refreshes immediately after Google Calendar sync.
- Files changed:
  - `src/app/(dashboard)/dashboard/periods/[id]/page.tsx` (activity create / update / delete onSuccess)
  - `src/app/(dashboard)/dashboard/periods/page.tsx` (period create / update / delete onSuccess)

**Steps 4-8 — Google Calendar lifecycle sync (frontend half) (2026-05-14)** — backend now auto-syncs activity/period CRUD to Google Calendar; the frontend surfaces it without inventing UI:
- `User` type gained optional `timezone: string` (`src/types/User.ts`).
- `authStore` gained `syncDeviceTimezone()` action: reads `Intl.DateTimeFormat().resolvedOptions().timeZone`, PATCHes `/me/timezone` only when it diverges from `user.timezone`, merges the response into local state, and silently `console.warn`s on failure (never blocks the app). _(Now a Redux thunk on `authSlice` — see Architecture.)_
- `AuthInitializer` now runs `syncDeviceTimezone()` once after `isInitialized && user.id` flips truthy — deps intentionally pinned to `user?.id` to avoid loops when the action itself updates the user.
- Installed `sonner@^2.0.7`. Mounted a single `<Toaster theme="dark" position="bottom-right" richColors closeButton />` in `(dashboard)/dashboard/layout.tsx` so toasts work across every dashboard route.
- `services/activities.service.ts` response types extended with `sync` envelopes (`CreateSyncResult`, `UpdateSyncResult`, `DeleteSyncResult`). `deleteActivity` now normalizes 204 vs 200-with-errors into a discriminated `DeleteActivityResult = { kind: 'ok' } | { kind: 'partial', id, sync }` so callers don't have to inspect the HTTP status.
- New `utils/activity-sync-toast.ts` centralizes the three toast branches per operation (success / partial-with-warning + `console.warn` of error detail / info when no occurrences). Update collapses `updated + created + deleted` into a single "N events synced" message so a `dayOfWeek` change still feels like one logical edit.
- `periods/[id]/page.tsx` wires `toastActivityCreate/Update/Delete` into the React Query `onSuccess` of each activity mutation. Dialog still closes only after the response (no optimistic close), so the user sees the sync result land before the form disappears.
- `RecurringActivityFormDialog` submit button now shows a spinner + `"Syncing to Google Calendar..."` copy while `isSubmitting` (5-15s waits for long periods).
- `ConfirmDeleteDialog` extended with an optional `pendingLabel` prop + spinner inside the destructive button; used as `"Syncing to Google Calendar..."` for both activity delete and period delete confirmations.
- `PeriodFormDialog`: subtle one-line helper text `"Changing dates will sync Google Calendar events accordingly."` appears only on edit, between the title field and date inputs. Save button uses the same spinner + sync copy treatment on edit.
- Period delete confirmation copy updated to: `"This will also remove all Google Calendar events created for this period's activities. Continue?"`.
- `pnpm tsc --noEmit` clean. `pnpm lint` clean for all files touched in this stage (pre-existing calendar/store lint issues unchanged).

**Step 2 polish (2026-05-13)** — `PeriodCard` now wraps its body in `next/link` `Link` (cmd-click/middle-click opens detail in a new tab); Edit/Delete buttons are sibling absolute-positioned overlays (not nested in the anchor) and keep `stopPropagation`. Removed manual `role="link"`, `tabIndex`, `onClick`, `onKeyDown` (next/link gives this for free); focus ring moved to `focus-within` on the wrapper. Detail page's "Back to periods" already uses `next/link`. typecheck + eslint clean.

**Step 2 update (2026-05-13)** — Recurring Activities (frontend):
- New detail route `app/(dashboard)/dashboard/periods/[id]/page.tsx`. Reads `id` via `useParams()`. Header has a back link, the period title + UTC-safe date range, and an "Add activity" button.
- Activities listed grouped by day of week. Display order: **Mon → Sun** (`WEEK_DISPLAY_ORDER = [1,2,3,4,5,6,0]`). Persisted ints follow JS `0=Sun..6=Sat`. Within each day, sorted by `startTime` asc (lex compare works because times are zero-padded `HH:mm`).
- `PeriodCard` is now a clickable link to the detail page (role=link + Enter/Space keyboard nav + focus ring). Edit/Delete buttons `stopPropagation` so they don't navigate. Date-formatting helpers extracted to `src/utils/period-dates.ts` (`formatPeriodRange`, `daysBetween`, `parseISODateUTC`).
- `ConfirmDeleteDialog` extended with optional `description` prop so the same component can be reused for activities (default text still references periods).
- New files: `src/types/activity.ts` (`DAYS_OF_WEEK`, `DAYS_OF_WEEK_LONG`, `WEEK_DISPLAY_ORDER`, `RecurringActivity`, `CreateActivityInput`, `UpdateActivityInput = CreateActivityInput`), `src/services/activities.service.ts` (named exports: `getActivities`, `getActivityById`, `createActivity`, `updateActivity`, `deleteActivity`), `src/utils/period-dates.ts`, `src/components/activities/RecurringActivityCard.tsx` (memoized), `src/components/activities/RecurringActivityFormDialog.tsx`.
- Form validates: title required; `endTime > startTime` (lex compare on `HH:mm`); `dayOfWeek` is an int 0..6. `aria-invalid` + `aria-describedby` wired to a single error region (mirrors `PeriodFormDialog`).
- React Query: `staleTime: 30_000` on both `period` and `activities` queries; mutations invalidate the activities cache. No mock data; fetch failures render error state with Retry.

**Latest update (2026-05-13)**: Added Periods page at `/dashboard/periods` (list, create/edit dialog, delete) wired to `/periods` via the existing axios client. Sidebar third tab renamed from "Habits" → "Periods" (icon switched from `Target` to `CalendarRange`, href → `/dashboard/periods`). New files: `src/app/(dashboard)/dashboard/periods/page.tsx`, `src/components/periods/PeriodCard.tsx`, `src/components/periods/PeriodFormDialog.tsx`, `src/services/periods.service.ts`, `src/types/period.ts`. No mock data — fetch failures render an error state with retry.

**Refactor pass (2026-05-13)** — addressed review feedback before Step 2:
- `PeriodFormDialog`: timezone-safe date round-trip via `slice(0,10)` and `${YYYY-MM-DD}T00:00:00.000Z` (no more `new Date(...)` shifts); `min`/`max` constraints across both date inputs; `aria-invalid` + `aria-describedby` wired to a single error region; arbitrary-value `font-['…']` classes replaced with `font-space-grotesk` / `font-jakarta`.
- `PeriodCard`: wrapped in `React.memo`; `daysBetween` returns `null` when `end < start` instead of clamping to 1; hardcoded hex colors replaced with `text-text-primary` / `text-text-muted` tokens.
- `types/period.ts`: `UpdatePeriodInput = CreatePeriodInput` (not `Partial<…>`) — the form submits the full record so no cast needed in the page.
- `periods/page.tsx`: replaced `window.confirm` with new `ConfirmDeleteDialog` (custom Dialog — we don't ship `@radix-ui/react-alert-dialog`); React Query gets `staleTime: 30_000`; mutations invalidate the cache instead of writing partial server-derived state via `setQueryData`; `openCreate`/`openEdit`/`requestDelete` are `useCallback`-stabilized; `extractAxiosErrorMessage` hoisted to `src/utils/api-error.ts` for Step 2/3 reuse.
- `app-sidebar.tsx`: `isActive` now derives from `usePathname()` (exact match or descendant); `<a href>` swapped for `next/link` to preserve React Query cache and client state across nav.
- `globals.css`: added `--bg-surface` / `--text-primary` / `--text-muted` CSS vars and registered matching utilities through `@theme inline` (`bg-bg-surface`, `text-text-primary`, `text-text-muted`).
- New files: `src/utils/api-error.ts`, `src/components/periods/ConfirmDeleteDialog.tsx`.

---

# Current Architecture (snapshot 2026-06-04)

**Project Version**: Product feature build-out (Periods · Recurring Activities · Tasks · Google Calendar sync · Onboarding · Account)
**Build Health**: `pnpm tsc --noEmit` ✅ clean · `pnpm lint` ✅ clean

## Executive Summary

NotebookLM is a Next.js 16.2.2 / React 19 application: a marketing landing page plus an authenticated dashboard. The dashboard's domain model is **Periods** (date ranges) → **Recurring Activities** (per-weekday schedules), which the backend auto-syncs to **Google Calendar**; the frontend reads those events back through a Google Calendar API layer and renders them in a React Big Calendar view. Additional features: a **Tasks** "Execution Queue", a 3-step **onboarding** wizard, and an **account** dialog with logout. State is split between **Redux Toolkit** (client/UI state) and **TanStack Query** (server cache). The entire `src/` tree has been decomposed into SOLID modules (<100 lines each).

## Technology Stack

### Core
- **Next.js** 16.2.2 (App Router) · **React** 19.2.4 · **TypeScript** 5 (strict, `@/*` → `./src/*`)
- **Tailwind CSS** 4 (`@theme inline` in `globals.css`) · **shadcn/ui** (radix-nova style, base color neutral)

### State & Data
- **@reduxjs/toolkit** 2.12.0 + **react-redux** 9.3.0 — global client/UI state
- **@tanstack/react-query** 5.100.1 (+ devtools) — server cache
- **axios** 1.15.1 — HTTP client (`withCredentials`, 401-refresh interceptor)
- ⚠️ **No Zustand** — fully migrated to Redux. Any doc/comment referencing `calendarStore.ts` is historical.

### UI & Calendar
- **react-big-calendar** 1.19.4 + **react-dnd** 16.0.1 (+ html5-backend) — calendar + drag/drop
- **moment** 2.30.1 (BigCalendar localizer) · **date-fns** 4.1.0 (formatting)
- **lucide-react** (icons) · **sonner** 2.0.7 (toasts) · **class-variance-authority** / **clsx** / **tailwind-merge**
- **@radix-ui/react-{dialog,label,select}** via shadcn

### Tooling
- PNPM (`pnpm-lock.yaml`) · ESLint 9 (+ eslint-config-next 16.2.2)
- Scripts: `pnpm dev` · `pnpm build` · `pnpm start` · `pnpm lint` · `pnpm tsc --noEmit`

## Routes & Layout Hierarchy

```
Root layout (app/layout.tsx)
├── ReduxProvider + QueryProvider + AuthInitializer + fonts (Plus Jakarta Sans, Space Grotesk)
│
├── (landing)/ layout → Navbar + Footer
│   └── /                         Landing: Hero · About · Architecture · CTA
│
├── (dashboard)/dashboard/ layout → OnboardingGuard + SidebarProvider + AppSidebar + dashboard <Toaster>
│   ├── /dashboard/calendar       WeeklyCalendar (Google Calendar events, fallback sample events)
│   ├── /dashboard/periods        Period list (usePeriods) — create/edit/delete dialogs
│   ├── /dashboard/periods/[id]   Period detail (usePeriodDetail) — activities grouped Mon→Sun
│   └── /dashboard/tasks          Execution Queue task list (tasksService)
│
├── /onboarding  (own minimal dark layout + own Toaster) → OnboardingWizard (3 steps)
├── /signup       Google OAuth entry ("Continue with Google" → :8000/auth/google)
├── /auth/callback  Parses user from URL → checks onboarding → routes to /onboarding or /dashboard/calendar
└── /test         Dev page: prints logged-in user name from Redux
```

**Auth/onboarding flow:** `/signup` → backend OAuth → `/auth/callback` (stores user in Redux, decides onboarding) → `/onboarding` (first-time) or `/dashboard/calendar`. `OnboardingGuard` (in dashboard layout) redirects to `/onboarding` when `user.onboardingCompletedAt` is null.

## State Management

### Redux Toolkit — `src/stores/`
Store (`stores/index.ts`) registers two reducers; serialization checks are disabled for the calendar paths that intentionally hold raw `Date` objects.

- **`authSlice.ts`** — `{ user, isAuthenticated, isLoading, isInitialized }`. Actions: `setUser`, `setIsAuthenticated`, `logout`. Thunks: `checkAuth()` (GET `/auth/user`), `syncDeviceTimezone()` (PATCH `/me/timezone`).
- **`calendarSlice.ts`** (types in `stores/calendar/calendarSlice.types.ts`) — `{ currentDate, view, selectedCalendarId, isEventModalOpen, selectedEventId, selectedSlot, isLoading, error }`. Actions: `setCurrentDate`, `setView`, `setSelectedCalendar`, `navigateCalendar`, `openCreateModal`, `openEditModal`, `closeModal`, `selectEvent`, `setLoading`, `setError`, `clearError`.
- **`stores/calendar/`** composite hooks (barrel `calendarHooks.ts`): `useCalendarState`, `useCalendarUIState`, `useCalendarActions`, `useCalendarNavigation`, `useEventManagement` (Redux UI + RQ mutations), `useCalendarWithEvents`.
- **`stores/hooks.ts`** — typed `useAppDispatch` / `useAppSelector`.

### TanStack Query — server cache
- Provider `components/providers/QueryProvider.tsx`: 5min stale, 10min gc, retry except 401/403, exponential backoff.
- **Query key factory** `hooks/calendar/google/queryKeys.ts` (`googleCalendarQueryKeys`): `calendars()`, `events()`, `eventsForCalendar(params)`, `sync(options)`.
- Other keys: `['periods']`, `['period', id]`, `['period', id, 'activities']`, tasks via `useQuery`.

## API & Services

- **`api/axios.ts`** — base `NEXT_PUBLIC_API_BASE_URL || http://localhost:8000`, `withCredentials: true` (httpOnly cookies). Response interceptor: on 401, dedups a single `POST /auth/refresh` (via shared `refreshPromise`) and retries; on refresh failure rejects (no silent logout).
- **`services/calendar/`** (barrel `calendar.service.ts`) — `calendars.ts` (GET `/calendar/calendars`), `events.ts` (GET `/calendar/events`), `mutations.ts` (POST/PUT/DELETE `/calendar/events`), `sync.ts` (multi-calendar fetch), `errors.ts` (typed `CalendarServiceError`), `factory.ts` (`calendarService` singleton).
- **`services/periods.service.ts`** — `getPeriods`, `getPeriodById`, `createPeriod`, `updatePeriod` (PATCH), `deletePeriod`.
- **`services/activities.service.ts`** — CRUD under `/periods/{pid}/activities`; create/update/delete return `sync` envelopes (`created`/`updated`/`deleted`/`skipped`/`errors[]`); delete normalized to `DeleteActivityResult = ok | partial`.
- **`services/tasks.service.ts`** — `tasksService`: GET `/tasks`, GET `/tasks/{id}`, PATCH `/tasks/{id}/done`.
- **`services/onboarding.service.ts`** — POST `/me/onboarding/complete` (idempotent).

## Custom Hooks (`src/hooks/`)

- **auth/** — `useLogout` (POST `/auth/logout` best-effort → Redux `logout` → `/signup`).
- **periods/** — `usePeriods` (list + create/update/delete + dialog state), `usePeriodDetail` (period + activities grouped by weekday + activity mutations + sync toasts), `useCrudDialogs<T>` (generic dialog state machine).
- **calendar/google/** — queries (`useGoogleCalendars`, `useGoogleCalendarEvents`, `useRawGoogleCalendarEvents`, `useGoogleCalendarSync`), mutations (`useCreate/Update/DeleteGoogleCalendarEvent`), cache utils (invalidate/prefetch).
- **calendar/calendar-with-google/** — `useCalendarWithGoogle` (events + calendars, sample fallback), `useCalendarStatusSync` (mirrors RQ loading/error into Redux).
- **calendar/event-generation/** — `useEventGeneration` (memoized sample fallback events).
- **use-mobile.ts** — `useIsMobile` (<768px).

## Component Map (`src/components/`)

- **account/** — `SidebarUserButton`, `AccountDialog`, `LogoutConfirmDialog`, `UserAvatar`.
- **activities/** — `RecurringActivityCard` + `recurring-activity-card/` parts; `RecurringActivityFormDialog` + `recurring-activity-form/` (fields, day picker, time fields, `useRecurringActivityForm`, utils/constants/types).
- **calendar/** — thin re-export shims (`Calendar`, `CalendarGrid`, `CalendarToolbar`, `EventForm`, `DeleteConfirmationDialog`) over SOLID subfolders `calendar-main/`, `calendar-grid/`, `calendar-toolbar/`, `event-form/`, `delete-dialog/`; plus `EventModal`, `GoogleCalendarProvider`, `CalendarEvent`, `CalendarDayHeader`, `FloatingChatButton`.
- **landing/** — `HeroSection`, `AboutSection` (+ `about/` parts), `ArchitectureSection`, `CTASection`.
- **onboarding/** — `OnboardingWizard`, `OnboardingGuard`, `WizardChrome`, `WizardSteps`, `StepIndicator`, `useOnboardingNavigation`; `steps/` (Welcome/Period/Activity + shared header/actions/error) with `period-step/` and `activity-step/` form subfolders.
- **periods/** — `PeriodCard`, `PeriodCardActions`, `PeriodFormDialog` (+ `period-form/` parts), `ConfirmDeleteDialog`, `ConfirmDeleteFooter`, `QueryErrorRetry`.
- **providers/** — `ReduxProvider`, `QueryProvider`.
- **shared/** — `Logo`, `Button`, `CardWrapper`, `Footer`, `SecondaryText`, `BreakThorugh` [sic], `Loader` (→ `loader-parts/`), `icons/`.
- **tasks/** — `TaskCard`, `TaskList`, `TaskDetailDialog` (+ `task-detail/` sections: description, badges, steps, resources, success criteria, done button).
- **ui/** — shadcn primitives: button, dialog, select, input, textarea, label, tooltip, sheet, separator, skeleton, sidebar, `app-sidebar`.
- Root: `Navigation.tsx` (landing navbar), `AuthInitializer.tsx` (boots `checkAuth` + timezone sync).

## Types & Utils

- **types/** — `activity.ts` (`ScheduleEntry`, `RecurringActivity`, `Create/UpdateActivityInput`, `DAYS_OF_WEEK*`, `WEEK_DISPLAY_ORDER`), `period.ts`, `task.ts`, `User.ts`, `calendar/` (event/props/state/store), `google-calendar/` (event/calendar-list/datetime/event-details/errors/sync).
- **utils/** — `activity-sync-toast`, `api-error`, `auth` (`parseUserFromUrl`), `cn`, `date-input`, `period-dates`; `calendar/` decomposed into `dates/`, `formats/`, `styles/` (incl. `google-event-colors` colorId→hex, `hex-to-rgba`), `transform/` (Google ↔ internal event mapping, SSR-safe description sanitize, validation guards).
- **styles/calendar.css** — dark-theme react-big-calendar overrides.

## SOLID Refactor

`SOLID_REFACTOR_PROGRESS.md` records all 13 domains complete (branch `refactor/frontend-solid-architecture`). Known remaining >100-line files (non-critical): `utils/calendar/calendar-transform.utils.ts` (~381), `services/calendar.service.ts` barrel (~297), `types/google-calendar.types.ts` (~290), `components/calendar/EventForm.tsx` (~298), `components/calendar/CalendarGrid.tsx` (~226).

## Conventions (from frontend/CLAUDE.md)

- Import `cn` from `@/utils/cn` (not `@/lib/utils`). Path alias `@/*` → `./src/*`.
- shadcn primitives in `components/ui/`, custom reusables in `components/shared/`.
- Prefer CSS variables / theme tokens over hardcoded hex; glassmorphism `bg-[#ffffff]/2 backdrop-blur-sm`; brand green `--green-nice: #008f4c`.
- TypeScript interfaces for all props; SOLID modules kept <100 lines.

## Backend Endpoints In Use (localhost:8000)

`GET /auth/user` · `POST /auth/refresh` · `POST /auth/logout` · `GET /auth/google` (OAuth start) · `PATCH /me/timezone` · `POST /me/onboarding/complete` · `GET/POST/PATCH/DELETE /periods[/:id]` · `GET/POST/PATCH/DELETE /periods/:pid/activities[/:id]` · `GET /tasks`, `GET /tasks/:id`, `PATCH /tasks/:id/done` · `GET /calendar/calendars` · `GET/POST/PUT/DELETE /calendar/events[/:id]`.
</content>
