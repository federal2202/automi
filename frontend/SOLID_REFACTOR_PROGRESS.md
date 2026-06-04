# SOLID Refactor — Progress Log

> **Цель:** перевести все компоненты/хуки/сервисы фронтенда на SOLID-модули, каждый файл < 100 строк.
> **Ветка:** `refactor/frontend-solid-architecture`
> **Метод:** работа выполняется через суб-агентов (frontend-agent / general-purpose), каждый домен = отдельный коммит.
>
> ⚠️ **Это файл возобновления.** Если сессия прервётся (лимиты), открой этот файл — здесь видно, что сделано, что в работе, и что дальше. Прогресс также продублирован в memory (`MEMORY.md` → `project_solid_refactor.md`).

---

## Легенда
- ✅ done & committed
- 🔄 in progress (есть незакоммиченные изменения)
- ⬜ todo
- 🚫 out of scope (shadcn `components/ui/`)

---

## Домены

| # | Домен | Статус | Коммит |
|---|-------|--------|--------|
| 1 | Stores (calendar slice/hooks) | ✅ | `e0768f0` |
| 2 | Activities (recurring dialog & card) | ✅ | `f25e68f`, `2f21ab0` |
| 3 | Periods (pages, form, dialogs) | ✅ | `371469b` |
| 4 | Onboarding (wizard & steps) | ✅ | `5f21d05` |
| 5 | Calendar — Google hooks | ✅ | `b5dc00a` |
| 6 | Calendar — utils (transform, styles, dates, formats) | ✅ | `6051459` |
| 7 | Calendar — services (`calendar.service.ts`) | ✅ | `4ac7ae9` |
| 8 | Calendar — types (`google-calendar.types.ts`, `calendar.types.ts`) | ✅ | `4ac7ae9` |
| 9 | Calendar — components (EventForm, CalendarGrid, Calendar, Toolbar, DeleteDialog) | ✅ | `7efd272` |
| 10 | Calendar — hooks (useEventGeneration, useCalendarWithGoogle) | ⬜ | — |
| 11 | Tasks (`TaskDetailDialog.tsx`) | ⬜ | — |
| 12 | Shared (`Loader.tsx`) | ⬜ | — |
| 13 | Landing (`AboutSection.tsx`) | ⬜ | — |

---

## Оставшиеся файлы > 100 строк (исключая `components/ui/` 🚫)

| Файл | Строк | Домен |
|------|-------|-------|
| `utils/calendar/calendar-transform.utils.ts` | 381 | 6 |
| `services/calendar.service.ts` | 297 | 7 |
| `types/google-calendar.types.ts` | 290 | 8 |
| `components/calendar/EventForm.tsx` | 298 | 9 |
| `components/calendar/CalendarGrid.tsx` | 226 | 9 |
| `hooks/calendar/useEventGeneration.ts` | 218 | 10 |
| `utils/calendar/calendarStyles.ts` | 209 | 6 |
| `components/calendar/Calendar.tsx` | 202 | 9 |
| `utils/calendar/dateUtils.ts` | 177 | 6 |
| `types/calendar/calendar.types.ts` | 170 | 8 |
| `components/tasks/TaskDetailDialog.tsx` | 164 | 11 |
| `components/shared/Loader.tsx` | 152 | 12 |
| `stores/calendar/useEventManagement.ts` | 150 | (review) |
| `hooks/periods/usePeriodDetail.ts` | 146 | (review) |
| `components/calendar/DeleteConfirmationDialog.tsx` | 137 | 9 |
| `utils/calendar/calendarFormats.ts` | 132 | 6 |
| `components/activities/recurring-activity-form/useRecurringActivityForm.ts` | 124 | (review) |
| `hooks/calendar/useCalendarWithGoogle.ts` | 121 | 10 |
| `hooks/periods/usePeriods.ts` | 119 | (review) |
| `components/landing/AboutSection.tsx` | 116 | 13 |
| `services/activities.service.ts` | 112 | (review) |
| `stores/authSlice.ts` | 106 | (review) |
| `stores/calendarSlice.ts` | 103 | (review) |
| `components/calendar/CalendarToolbar.tsx` | 103 | 9 |

> Файлы, помеченные `(review)`, лишь немного превышают 100 строк — решаем по месту, дробить или оставить.

---

## Done — детали

### Домен 5: Calendar — Google hooks 🔄
`hooks/calendar/useGoogleCalendar.ts` (344 стр) → разбит на `hooks/calendar/google/`:
- `queryKeys.ts` (40) — фабрика query keys + DEFAULT_QUERY_OPTIONS
- `queries.ts` (~80) — useGoogleCalendars / Events / RawEvents / Sync
- `mutations.ts` (98) — create / update / delete мутации
- `utils.ts` (77) — invalidate + prefetch + invalidateEventQueries
- `index.ts` (50) — barrel + `googleCalendarHooks` collection
- `useGoogleCalendar.ts` (9) — тонкий re-export `export * from './google'` (обратная совместимость)

`tsc --noEmit` ✅ проходит. Все внешние импорты (`useEventManagement`, `GoogleCalendarProvider`, onboarding steps, periods hooks, `useCalendarWithGoogle`) продолжают работать через barrel.

---

## Как продолжить
1. Открой этот файл + `git log --oneline -10`.
2. Найди первый ⬜ домен в таблице сверху.
3. Запусти суб-агента (`frontend-agent`) с задачей: разбить файлы домена на модули < 100 строк, сохранив публичные импорты через barrel.
4. `npx tsc --noEmit` + `pnpm lint` → коммит → обнови этот файл (статус + коммит-хеш).
