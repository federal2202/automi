# Scheduling System — Build Plan

This document is the working plan for the pivot described in `task_for_claude.md`. It supersedes that doc where they differ (notably: period length, build order, exception handling). Agents working on this project should read this file before starting any task.

Last updated: 2026-05-13

---

## Progress log

### Step 1 — Periods page  *(complete, 2026-05-13)*

**Backend** — review 9/10, **READY**.
- `Period` model in `prisma/schema.prisma` (cascade on User delete, composite index `[userId, startDate]`, TODO comment for future Step 2 cascade).
- Migration: `20260513102407_add_period_model`.
- `src/controllers/periods.controller.ts` — list/getById/create/update/delete, all scoped by `req.user!.id`. PATCH validates against merged candidate but writes only present keys (no `updatedAt` bump on no-op). DELETE single-trip via `deleteMany` + count → 404. Unknown body keys → 400 listing offenders. Validation errors mention ISO 8601.
- `src/routes/periods.ts` mounted at `/periods` behind `authenticateToken` in `src/index.ts`.
- `src/utils/ownership.ts` — generic `assertOwnership` helper (typed, no `any`); reused by getById/update; ready for Step 2/3.
- `src/index.ts:44` unused-param diagnostic fixed (`_req`).

**Frontend** — review 9/10, **READY**.
- New page `app/(dashboard)/dashboard/periods/page.tsx`; components `PeriodCard`, `PeriodFormDialog`, `ConfirmDeleteDialog`; service `services/periods.service.ts` (named exports only); types `types/period.ts` (`UpdatePeriodInput = CreatePeriodInput`); util `utils/api-error.ts` (`extractAxiosErrorMessage`).
- Sidebar third tab renamed **Habits → Periods** (icon `CalendarRange`, href `/dashboard/periods`); `isActive` now derived from `usePathname()` with `aria-current="page"`; `<a>` → `next/link`.
- Timezone handling: form uses pure `YYYY-MM-DD` slicing (no `new Date()` round-trip); `PeriodCard` formats in UTC via `timeZone: 'UTC'` + `Date.UTC` so card and form always agree; `daysBetween` is DST-immune.
- Design tokens: `--bg-surface`, `--text-primary`, `--text-muted` declared in `globals.css` and registered via `@theme inline`; font utilities `font-space-grotesk` / `font-jakarta` used throughout (no arbitrary-value font classes).
- A11y: `aria-invalid` + `aria-describedby` with `useId()` on form inputs; `ConfirmDeleteDialog` (Radix) replaces `window.confirm`, blocks dismiss while mutation pending.
- React Query: `staleTime: 30_000`; mutations invalidate (no hybrid `setQueryData`).
- Perf: `PeriodCard` is `React.memo`'d; parent callbacks stabilized with `useCallback`.
- Date inputs cross-constrained with `min`/`max`; `daysBetween` returns `null` on invalid ranges.

**Verification**: `npx tsc --noEmit` clean both sides. No mock data. JWT on every route. `cn` from `@/utils/cn`. `withCredentials: true` preserved.

### Step 2 — Recurring Activities  *(complete, 2026-05-13)*

**Backend** — review 9/10, **READY**.
- `RecurringActivity` model in `prisma/schema.prisma` (cascade on both Period and User; indexes `[userId, periodId]` and `[periodId, dayOfWeek]`); reverse relations on Period + User.
- Migration: `20260513105727_add_recurring_activity_model`.
- `src/controllers/recurring-activities.controller.ts` — list/getById/create/update/delete, every handler verifies parent period ownership via `assertOwnership`, every query scoped by `userId` + `periodId`. PATCH writes only present keys; DELETE single-trip; unknown body keys → 400. Time regex anchored, zero-pad strict; `endTime > startTime` enforced; `dayOfWeek` integer 0..6 only.
- `src/routes/recurring-activities.ts` with `Router({ mergeParams: true })`, nested under `periods.ts` (`router.use('/:periodId/activities', activitiesRouter)`); JWT inherited from parent. `index.ts` untouched.
- Post-review polish: extracted `src/utils/request-validation.ts` (`rejectUnknownKeys`, `requireParam`); both controllers now use shared helpers; eliminated `as string` param casts; wire format unchanged.

**Frontend** — review 9/10, **READY**.
- New detail route: `app/(dashboard)/dashboard/periods/[id]/page.tsx`.
- New components: `activities/RecurringActivityCard` (memoized), `activities/RecurringActivityFormDialog`.
- New service: `services/activities.service.ts` (named exports).
- New types: `types/activity.ts` — `RecurringActivity`, `CreateActivityInput`, `UpdateActivityInput = CreateActivityInput`, `DAYS_OF_WEEK`, `DAYS_OF_WEEK_LONG`, `WEEK_DISPLAY_ORDER = [1,2,3,4,5,6,0]` (Mon→Sun).
- New util: `utils/period-dates.ts` — shared UTC-safe `formatPeriodRange`, `daysBetween`, `parseISODateUTC` used by both card and detail page.
- `PeriodCard` rebuilt with `next/link` wrapping the title/description region; Edit/Delete are sibling overlays outside the anchor (cmd-click / middle-click / "open in new tab" all work natively).
- `ConfirmDeleteDialog` gained an optional `description` prop, reused for activities.
- Day-of-week persisted as int 0..6 (JS `Date.getDay()` convention); display in Mon→Sun order; within each day, activities sorted by `startTime` asc.
- a11y: `aria-invalid` + `aria-describedby` via `useId()`; `role="alert"` + `aria-live="polite"` error region.
- React Query: `staleTime: 30_000`; invalidate-only mutations.

**Verification**: `npx tsc --noEmit` clean both sides; `eslint` clean on touched files; no mock data; JWT on every route.

---

## Product summary

A lightweight scheduling system on top of Google Calendar. The user defines **Periods** (life phases) and **Recurring Activities** inside them. The backend generates individual Google Calendar events for the next 7 days from those rules, with a mapping table for safe update/delete and duplicate prevention.

Google Calendar is the source of truth for events. Our backend stores only rules, periods, exceptions, and sync mappings.

---

## Core rules (locked in)

1. **Period duration is user-defined.** Any startDate/endDate. Not fixed to 7 days.
2. **The 7-day window is the materialization horizon, not the period length.** Two different things.
3. **Periods can overlap.** Multiple periods can be active simultaneously.
4. **Per-occurrence flexibility is required.** A single date can be skipped or modified without touching the underlying rule.
5. **Rule + exception data design:**
   - `RecurringActivity` = the rule (periodId, title, dayOfWeek, startTime, endTime)
   - `ActivityException` = per-date overrides. Two kinds: **SKIP** (don't generate that day) and **MODIFY** (override time/title for that day).
6. **No mock calendar data.** Real Google reads only. On fetch failure, show an error — do not fall back to mocks.
7. **Tasks page and `Task` model are out of scope.** Leave them untouched.
8. **Generation triggers:** on-save (when an activity is created/edited) + on-login top-up of the 7-day window. No cron infra at MVP.
9. **Build order:** engine first, onboarding last.
10. **New page:** `/dashboard/periods`. Rename the third sidebar tab to "Periods" (or a nicer name TBD).

---

## Build sequence

### Step 1 — Periods page  ← START HERE
**Backend**
- Add `Period` model to `backend/prisma/schema.prisma`:
  - `id` (cuid), `userId` (FK → User), `title` (String), `startDate` (DateTime), `endDate` (DateTime), `createdAt`, `updatedAt`
  - Relation back on `User` (`periods Period[]`)
- Run Prisma migration.
- `src/controllers/periods.controller.ts` — CRUD handlers (list, getById, create, update, delete), all scoped to `req.user!.id`.
- `src/routes/periods.ts` — wires `/periods` paths to controller, JWT-protected via existing auth middleware.
- Register the route in `src/index.ts` (or wherever routes are mounted).

**Frontend**
- New route: `frontend/src/app/(dashboard)/dashboard/periods/page.tsx`.
- Rename the third sidebar tab to "Periods" and point it at `/dashboard/periods`.
- Page shows: list of periods (title + date range), "Create period" button, edit/delete on each row.
- Use existing axios client (`src/api/axios.ts`) with `withCredentials: true`.
- No mock data — show error states when API fails.

### Step 2 — Recurring Activities (nested inside a period)
- Backend: `RecurringActivity` model (id, periodId FK, title, dayOfWeek 0-6, startTime, endTime, userId). CRUD endpoints scoped to a periodId.
- Frontend: activities section on a period detail view; add/edit/delete activities.

### Step 3 — Activity Exceptions (per-day SKIP / MODIFY)
- Backend: `ActivityException` model (id, recurringActivityId FK, date, kind: 'SKIP'|'MODIFY', overrideTitle?, overrideStartTime?, overrideEndTime?). Endpoints to create/delete an exception.
- Frontend: UI to skip or override a single occurrence.

### Step 4 — Generation service
- Backend service: given a userId, for each active RecurringActivity, expand dates within the next 7 days, apply exceptions, write Google Calendar events for any date not already in SyncedEvents.
- Triggered on activity create/update.

### Step 5 — SyncedEvents mapping
- Backend: `SyncedEvent` model (id, userId, googleEventId, sourceType, sourceId, date). Used for duplicate prevention.
- Generator writes a mapping row for every Google event it creates.

### Step 6 — Safe delete/update + duplicate prevention
- On activity delete: look up all SyncedEvents for that activity, delete the corresponding Google events, delete mappings.
- On activity update: look up SyncedEvents, update Google events in place (don't recreate), keep mappings.
- Before creating a new Google event in the generator: check SyncedEvents by (sourceType, sourceId, date) → skip if exists.

### Step 7 — On-login window top-up
- On `/auth/user` success (or a dedicated `/sync/topup` endpoint hit by frontend on app load), run the generator for the user. Idempotent thanks to SyncedEvents checks.

### Step 8 — Calendar page cleanup
- Replace the existing mocked Zustand CRUD on `/dashboard/calendar` with real Google reads via `GET /calendar/events`. No mock fallback.

### Step 9 — Onboarding ("Lifestyle Setup") — LAST
- Frontend: 4-screen onboarding (basic lifestyle, sleep, productivity, schedule type).
- Backend: `UserPreferences` model + endpoint to save onboarding answers.
- Wire onboarding to run once for new users, then redirect to `/dashboard/periods`.

---

## Out of scope for MVP
- AI scheduling, task prioritization, free-slot engine, smart rescheduling.
- Internal calendar event storage (Google is the store).
- Cron-based generation (we use on-save + on-login top-up instead).
- Overlap detection between activities (let both events exist; user resolves with SKIP).
- Native Google recurring events — we always generate individual events.

---

## Conventions agents must follow
- Backend: controllers hold logic, routes only wire paths (see `backend/CLAUDE.md`).
- Frontend: PNPM, Next.js 16 App Router, Tailwind 4, Zustand, `@/*` path alias, `cn` from `@/utils/cn` (see `frontend/CLAUDE.md`).
- All new backend endpoints require JWT auth and scope queries by `req.user!.id`.
- No mock data anywhere in this feature.
- Before starting any task, agents must read `frontend/project_state.md` and `backend/PROGRESS.md` so they know what already exists in the codebase.

---

## Working-style rules (carry over to every session)

1. **Engine first, onboarding last.** When a task doc lists onboarding as step 1, ignore that ordering. The onboarding form is a UI shell that just persists preferences — not part of the core engine. The user wants to iterate on the engine without going through a form every time.

2. **Document rules from chat.** When the user states product rules or constraints during a planning conversation ("the rule is X" / "btw remember Y"), write them into this file in the same turn. The chat is the spec; this file is the durable record.

3. **No mock data fallbacks.** If a fetch fails, show an error. Never quietly substitute mock data.

4. **Tasks page and `Task` model are untouched** for the duration of this pivot. Integration is considered later.

5. **Defer to this file over `task_for_claude.md`** where they differ (period length, build order, exception handling).
