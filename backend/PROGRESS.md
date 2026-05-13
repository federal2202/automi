# Backend Development Progress

## ✅ ПРОЕКТ ЗАВЕРШЁН И ИНТЕГРИРОВАН С FRONTEND

## Цель проекта
✅ Backend на Express + TypeScript с интеграцией Google Calendar через OAuth - **ГОТОВО**
✅ Полная интеграция с Next.js frontend - **ГОТОВО**

## Архитектура аутентификации (РЕАЛИЗОВАНО)
- ✅ **Google OAuth 2.0** - полная реализация с callback обработкой
- ✅ **JWT токены** - 30 мин access + 7 дней refresh в httpOnly cookies
- ✅ **Google токены** - автообновление через refresh token
- ✅ **httpOnly Cookies** - максимальная безопасность токенов
- ✅ **Cross-tab persistence** - аутентификация сохраняется между вкладками

## Текущий статус
✅ **Полная интеграция с frontend завершена (2026-04-21)**
✅ База данных настроена и миграции созданы
✅ Все endpoints протестированы и работают
✅ Frontend успешно использует API

### Установленные пакеты
- googleapis, jsonwebtoken, bcrypt, prisma, @prisma/client
- @types/jsonwebtoken, @types/bcrypt, @prisma/cli, @types/node

### База данных
- Подключение: Supabase PostgreSQL ✅
- Таблица: Users (googleId, email, name, picture, accessToken, refreshToken, expiresAt, scope) ✅
- Миграции: выполнены ✅

---

## Детальный план разработки

### ШАГ 1: Google Cloud Console OAuth setup
**Что делаем:** Настраиваем Google OAuth в Google Cloud Console
**Цель:** Получить CLIENT_ID и CLIENT_SECRET для аутентификации

**Действия:**
1. Идем в [Google Cloud Console](https://console.cloud.google.com)
2. Создаем новый проект или выбираем существующий
3. Включаем Google Calendar API
4. Настраиваем OAuth consent screen
5. Создаем OAuth 2.0 Client ID
6. Добавляем redirect URIs: `http://localhost:3000/auth/google/callback`
7. Копируем CLIENT_ID и CLIENT_SECRET в .env

**Файлы для обновления:**
- `.env` - добавить GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET

---

### ШАГ 2: JWT Middleware
**Что делаем:** Создаем middleware для проверки JWT токенов
**Цель:** Защищать API endpoints от неавторизованного доступа

**Логика:**
- Читаем Bearer token из заголовка Authorization
- Проверяем JWT подпись и срок действия
- Извлекаем userId и добавляем в req.user
- Если токен невалидный - возвращаем 401

**Файл:** `src/middleware/auth.ts`
```typescript
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface JWTPayload {
  userId: string;
  iat: number;
  exp: number;
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}
```

**Файлы для создания:**
- `src/middleware/auth.ts`
- Обновить `.env` - добавить JWT_SECRET

---

### ШАГ 3: Типы и утилиты
**Что делаем:** Создаем типы и helper функции
**Цель:** Типизация для TypeScript и переиспользуемые функции

**Файл:** `src/types/express.d.ts`
```typescript
import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
```

**Файл:** `src/utils/jwt.ts`
```typescript
import jwt from 'jsonwebtoken';

export function generateAccessToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '15m' });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
}
```

**Файлы для создания:**
- `src/types/express.d.ts`
- `src/utils/jwt.ts`

---

### ШАГ 4: Google OAuth Routes
**Что делаем:** Создаем endpoints для Google OAuth
**Цель:** Авторизация через Google и получение Calendar токенов

**Логика:**
1. `/auth/google` - редирект на Google OAuth
2. `/auth/google/callback` - обработка callback от Google
3. Сохранение пользователя в БД с Google токенами
4. Возврат JWT токенов клиенту

**Файл:** `src/routes/auth.ts`
```typescript
import express from 'express';
import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

const router = express.Router();
const prisma = new PrismaClient();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Инициация OAuth
router.get('/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['email', 'profile', 'https://www.googleapis.com/auth/calendar'],
    prompt: 'consent'
  });
  
  res.redirect(authUrl);
});

// Callback после авторизации
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);
    
    // Получаем информацию о пользователе
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    
    // Сохраняем пользователя в БД
    const user = await prisma.user.upsert({
      where: { googleId: userInfo.data.id! },
      update: {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || undefined,
        expiresAt: new Date(tokens.expiry_date!),
        scope: tokens.scope!
      },
      create: {
        googleId: userInfo.data.id!,
        email: userInfo.data.email!,
        name: userInfo.data.name!,
        picture: userInfo.data.picture,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        expiresAt: new Date(tokens.expiry_date!),
        scope: tokens.scope!
      }
    });
    
    // Генерируем JWT токены
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });
  } catch (error) {
    res.status(400).json({ error: 'Authorization failed' });
  }
});

export default router;
```

**Файлы для создания:**
- `src/routes/auth.ts`

---

### ШАГ 5: Calendar API Integration
**Что делаем:** Создаем endpoints для работы с Google Calendar
**Цель:** CRUD операции с календарными событиями

**Файл:** `src/routes/calendar.ts`
```typescript
import express from 'express';
import { google } from 'googleapis';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Применяем middleware ко всем routes
router.use(authenticateToken);

// Получение списка календарей
router.get('/calendars', async (req, res) => {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: req.user!.accessToken,
      refresh_token: req.user!.refreshToken
    });
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const calendars = await calendar.calendarList.list();
    
    res.json(calendars.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch calendars' });
  }
});

// Получение событий
router.get('/events', async (req, res) => {
  const { calendarId = 'primary', timeMin, timeMax } = req.query;
  
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: req.user!.accessToken,
      refresh_token: req.user!.refreshToken
    });
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const events = await calendar.events.list({
      calendarId: calendarId as string,
      timeMin: timeMin as string,
      timeMax: timeMax as string,
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    res.json(events.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

export default router;
```

**Файлы для создания:**
- `src/routes/calendar.ts`

---

### ШАГ 6: Main App Setup
**Что делаем:** Собираем все вместе в main приложении
**Цель:** Настроить Express сервер и подключить все routes

**Файл:** `src/app.ts`
```typescript
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import calendarRoutes from './routes/calendar';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/calendar', calendarRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Файлы для создания:**
- `src/app.ts`

---

### ШАГ 7: Environment Variables
**Что делаем:** Финальная настройка переменных окружения
**Цель:** Все необходимые ключи для работы

**Файл:** `.env` (финальный вид)
```
# Database
DIRECT_URL="your-supabase-direct-url"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"  
GOOGLE_REDIRECT_URI="http://localhost:3000/auth/google/callback"

# Server
PORT=3000
```

---

### ШАГ 8: Testing & Scripts
**Что делаем:** Добавляем скрипты для запуска и тестирования
**Цель:** Удобная разработка и проверка

**Обновить `package.json`:**
```json
{
  "scripts": {
    "dev": "ts-node src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "db:migrate": "npx prisma migrate dev",
    "db:generate": "npx prisma generate"
  }
}
```

---

## ✅ ПРОЕКТ ПОЛНОСТЬЮ ЗАВЕРШЁН - BACKEND + FRONTEND INTEGRATION

### Основные компоненты (ВСЕ ГОТОВО)
✅ **Google OAuth 2.0 Flow** - полная реализация с красивым UI
✅ **JWT аутентификация** - httpOnly cookies для максимальной безопасности
✅ **Calendar API endpoints** - готовы к использованию
✅ **База данных Supabase + Prisma** - все таблицы и связи настроены
✅ **Express сервер** - полностью настроен с middleware и логированием
✅ **Frontend интеграция** - Next.js полностью подключен к backend

### Дополнительные улучшения (ВСЕ РЕАЛИЗОВАНО)
✅ **httpOnly Cookies Security** - токены недоступны для JavaScript
✅ **Cross-tab Authentication** - аутентификация работает между вкладками браузера
✅ **Auto Token Refresh** - автоматическое обновление токенов
✅ **Beautiful Signup Page** - glassmorphism дизайн с зелёным свечением
✅ **Error Handling** - полная обработка ошибок на frontend и backend
✅ **Persistent Sessions** - пользователь остаётся аутентифицированным
✅ **Logging System** - полное логирование всех операций
✅ **Cookie Parser Integration** - правильная обработка httpOnly cookies

## 🎉 ИНТЕГРАЦИЯ С FRONTEND ЗАВЕРШЕНА УСПЕШНО!

### Реализованные API Endpoints:
**Authentication (Все работают):**
- ✅ `GET /auth/google` - инициация OAuth (редирект на Google)
- ✅ `GET /auth/google/callback` - обработка callback от Google с установкой cookies
- ✅ `GET /auth/user` - получение текущего пользователя (проверка httpOnly cookies)
- ✅ `POST /auth/refresh` - обновление JWT токенов
- ✅ `POST /auth/logout` - выход из системы с очисткой cookies

**Calendar (Готовы к использованию):**
- ✅ `GET /calendar/calendars` - список календарей пользователя
- ✅ `GET /calendar/events` - события календаря с фильтрацией

**System:**
- ✅ `GET /health` - проверка работы сервера

### Frontend Components (Все созданы и работают):
- ✅ **AuthStore (Zustand)** - управление состоянием аутентификации
- ✅ **Signup Page** - красивый дизайн с Google OAuth кнопкой
- ✅ **Auth Callback Handler** - обработка OAuth redirect
- ✅ **AuthInitializer** - автоматическая проверка аутентификации на каждой странице
- ✅ **Axios Configuration** - настроен withCredentials для httpOnly cookies
- ✅ **User Types** - полная типизация TypeScript

## 🚀 ПРОЕКТ ГОТОВ К PRODUCTION!

### Что работает прямо сейчас:
1. **Пользователь заходит на /signup** → видит красивую страницу входа
2. **Нажимает "Login with Google"** → перенаправляется на Google OAuth
3. **Авторизуется на Google** → возвращается в приложение
4. **Автоматически аутентифицируется** → видит своё имя на /test странице
5. **Открывает новую вкладку** → остаётся аутентифицированным (cross-tab persistence)
6. **Закрывает браузер и открывает снова** → остаётся аутентифицированным (persistent sessions)

### Следующие возможные этапы (по желанию):
- 📱 Подключение календарного функционала к Google Calendar API
- 🔄 Real-time обновления календаря
- 👥 Многопользовательские функции
- 📊 Аналитика и метрики
- 🎨 Дополнительные UI улучшения

## ✅ МИССИЯ ВЫПОЛНЕНА - ПОЛНАЯ АУТЕНТИФИКАЦИЯ РЕАЛИЗОВАНА!

---

## Scheduling pivot — Step 1 (Periods backend) — 2026-05-13
- Added `Period` model to `prisma/schema.prisma` (id cuid, userId FK → User onDelete: Cascade, title, startDate, endDate, createdAt, updatedAt; index on `[userId, startDate]`). Reverse relation `periods Period[]` added to User.
- Migration: `20260513102407_add_period_model` (run via `pnpm exec prisma migrate dev --name add_period_model`).
- New files:
  - `src/controllers/periods.controller.ts` — list/getById/create/update/delete, all scoped to `req.user!.id`, ownership-checked, with title/date validation (endDate >= startDate).
  - `src/routes/periods.ts` — JWT-protected `/periods` router.
- Mounted in `src/index.ts` as `app.use('/periods', periodsRoutes)`.
- Endpoints:
  - `GET    /periods`        — list current user's periods (orderBy startDate desc)
  - `GET    /periods/:id`    — single period (404 if not owned)
  - `POST   /periods`        — create (201)
  - `PATCH  /periods/:id`    — partial update with merged-candidate validation
  - `DELETE /periods/:id`    — delete (204)

## Step 1 — post-review refactors (2026-05-13)

Cleanup pass after the 8/10 review. No behavioural changes to status codes, routes, or auth; this is internal hygiene.

- `src/index.ts` — `/health` handler param `req` renamed to `_req` to clear the unused-parameter TS diagnostic.
- New `src/utils/ownership.ts` — generic `assertOwnership(delegate, id, userId)` helper (typed via an `OwnershipDelegate<T>` interface, no `any`). Pre-empts duplication when Step 2 (RecurringActivity) and Step 3 (ActivityException) need the same `findFirst({ id, userId })` pattern.
- `src/controllers/periods.controller.ts`:
  - `getById` and `update` now go through `assertOwnership`.
  - `delete` switched to a single-round-trip `deleteMany({ where: { id, userId } })` with `count === 0` -> 404. Removes the prior fetch-then-delete pair.
  - `update` now writes ONLY the fields actually present in `req.body` (no more bumping `updatedAt` on a no-op PATCH and no more rewriting fields the client didn't touch). The merged candidate is still built — but only for VALIDATION, so `endDate >= startDate` keeps checking against the current row.
  - Added strict unknown-field rejection on POST and PATCH (400 with the offending keys listed).
  - Dropped the dead `instanceof Date` branch in `parseAndValidatePeriod`; error messages now specify ISO 8601.
- `prisma/schema.prisma` — added a TODO comment near `Period` reminding Step 2 to declare `RecurringActivity -> Period` with `onDelete: Cascade`. User -> Period cascade is unchanged.
- Typecheck: `npx tsc --noEmit --ignoreDeprecations 6.0` is clean (zero diagnostics after `prisma generate`).

## Scheduling pivot — Step 2 (Recurring Activities backend) — 2026-05-13
- Added `RecurringActivity` model to `prisma/schema.prisma`: id (cuid), periodId FK → Period (onDelete: Cascade), userId FK → User (onDelete: Cascade), title, dayOfWeek (Int 0..6), startTime/endTime (String "HH:mm"), timestamps. Indexes: `[userId, periodId]`, `[periodId, dayOfWeek]`. `@@map("recurring_activities")`.
- Reverse relations added: `recurringActivities RecurringActivity[]` on both `User` and `Period`.
- Removed the Step 2 TODO comment near `Period` — cascade is now wired (`onDelete: Cascade` on the RecurringActivity → Period relation).
- Migration: `20260513105727_add_recurring_activity_model` (`pnpm exec prisma migrate dev --name add_recurring_activity_model`), followed by `prisma generate`.
- New files:
  - `src/controllers/recurring-activities.controller.ts` — list/getById/create/update/delete, all scoped by `userId` AND `periodId`, ownership-checked. Strict validation: title non-empty, dayOfWeek integer 0..6, startTime/endTime match `^([01]\d|2[0-3]):[0-5]\d$`, endTime > startTime (lexicographic on zero-padded HH:mm). Unknown body keys → 400 listing offenders. PATCH validates merged candidate, writes only present keys, no-op returns existing row. DELETE single-trip `deleteMany` scoped by `{id, userId, periodId}` → 404 on `count === 0`.
  - `src/routes/recurring-activities.ts` — `Router({ mergeParams: true })` so `:periodId` propagates from the parent.
- Mounting: nested under periods router via `periodsRouter.use('/:periodId/activities', recurringActivitiesRouter)`. `authenticateToken` on the parent covers the children (verified — no double mount, no separate auth needed).
- Endpoints:
  - `GET    /periods/:periodId/activities`       — list (orderBy dayOfWeek asc, then startTime asc)
  - `GET    /periods/:periodId/activities/:id`   — single
  - `POST   /periods/:periodId/activities`       — create (201). `periodId` taken from URL, never body.
  - `PATCH  /periods/:periodId/activities/:id`   — partial update
  - `DELETE /periods/:periodId/activities/:id`   — delete (204)
- Every handler first verifies the parent period belongs to `req.user!.id` via `assertOwnership(prisma.period, periodId, userId)` (404 if not). All activity queries are scoped by `userId` AND `periodId`.
- Typecheck: `npx tsc --noEmit --ignoreDeprecations 6.0` clean.

## Step 2 — post-review polish (2026-05-13)
- Extracted shared request-validation helpers to `src/utils/request-validation.ts`: `rejectUnknownKeys(body, allowed)` returns the offending keys (controllers compose the existing `Unknown fields: …. Allowed: …` 400 response themselves so wire format is unchanged), and `requireParam(value, name)` narrows `req.params.*` from `string | undefined` to `string` and throws on missing. Refactored `periods.controller.ts` and `recurring-activities.controller.ts` to use both — no more duplicated unknown-key logic, no more `as string` casts on route params. Behaviour, status codes, and validation order are identical. Typecheck clean.