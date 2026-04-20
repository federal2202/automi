# Документация API Backend (Поток данных)

## Обзор архитектуры
Ваш backend - это Node.js Express сервер с Google OAuth аутентификацией и интеграцией с Google Calendar.

### Технический стек
- **Express.js** - Web фреймворк
- **Prisma** - ORM для базы данных (PostgreSQL через Supabase)
- **Google APIs** - OAuth и интеграция с календарем
- **JWT** - Управление сессиями
- **TypeScript** - Типизация


### Схема базы данных
Одна модель `User` хранит:
- Базовую информацию (googleId, email, name, picture)
- Google OAuth токены (accessToken, refreshToken, expiresAt, scope)

## API Эндпоинты

### 1. Проверка работоспособности (Без авторизации)

#### Проверка здоровья сервера
```
GET /health
Ответ: { "status": "ok" }
```

#### Приветствие (Тестирование)
```
GET /hello
Ответ: { "message": "Hello, world!" }
```

### 2. Поток аутентификации

#### Начало OAuth потока
```
GET /auth/google
→ Перенаправляет пользователя на страницу согласия Google OAuth
→ Пользователь предоставляет разрешения календаря
→ Google перенаправляет на /auth/callback
```

#### OAuth Callback
```
GET /auth/callback?code=<authorization_code>
→ Обменивает код авторизации на Google токены
→ Создает или обновляет пользователя в базе данных
→ Возвращает JWT токены + информацию о пользователе

Ответ:
{
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token", 
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "Имя Пользователя",
    "picture": "url_фото_профиля"
  }
}
```

#### Обновление JWT токенов
```
POST /auth/refresh
Заголовки: Content-Type: application/json
Тело: { "refreshToken": "ваш_refresh_token" }

Ответ:
{
  "accessToken": "новый_jwt_access_token",
  "refreshToken": "новый_jwt_refresh_token"
}
```

#### Выход из системы
```
POST /auth/logout
Ответ: { "message": "Logged out successfully" }
Примечание: Черный список JWT не реализован
```

### 3. Эндпоинты календаря (Требуют JWT авторизацию)

Все эндпоинты календаря требуют заголовок `Authorization: Bearer <accessToken>`.

#### Список календарей пользователя
```
GET /calendar/calendars
Заголовки: Authorization: Bearer <jwt_access_token>

Ответ: Формат Google Calendar API
{
  "items": [
    {
      "id": "calendar_id",
      "summary": "Название календаря",
      ...
    }
  ]
}
```

#### Получение событий календаря
```
GET /calendar/events?calendarId=primary&timeMin=2024-01-01T00:00:00Z&timeMax=2024-12-31T23:59:59Z
Заголовки: Authorization: Bearer <jwt_access_token>

Параметры запроса:
- calendarId: ID календаря (по умолчанию: 'primary')
- timeMin: Время начала (ISO 8601)
- timeMax: Время окончания (ISO 8601)

Ответ: Формат Google Calendar API
{
  "items": [
    {
      "id": "event_id",
      "summary": "Название события",
      "start": { "dateTime": "2024-01-01T10:00:00Z" },
      "end": { "dateTime": "2024-01-01T11:00:00Z" },
      ...
    }
  ]
}
```

## Интеграция с клиентом

### Рекомендуемый поток аутентификации

1. **Проверка работоспособности**
   ```
   GET http://localhost:8000/health
   ```

2. **Тестирование backend**
   ```
   GET http://localhost:8000/hello
   ```

3. **Запуск OAuth** (Перенаправление браузера пользователя)
   ```
   GET http://localhost:8000/auth/google
   ```

4. **Обработка OAuth Callback**
   - Пользователь перенаправляется на `/auth/callback` после согласия Google
   - Извлекаем JWT токены из ответа
   - Сохраняем `accessToken` и `refreshToken` безопасно

5. **Выполнение аутентифицированных запросов**
   - Включаем `Authorization: Bearer <accessToken>` во все вызовы calendar API
   - Обрабатываем 401 ответы обновлением токенов

6. **Обновление токенов**
   ```
   POST http://localhost:8000/auth/refresh
   Тело: { "refreshToken": "сохраненный_refresh_token" }
   ```

### Последовательность тестирования в Postman

1. **Базовые тесты**
   ```
   GET http://localhost:8000/health
   GET http://localhost:8000/hello
   ```

2. **OAuth поток** (Требуется браузер)
   ```
   GET http://localhost:8000/auth/google
   → Копируем URL перенаправления и открываем в браузере
   → Завершаем Google OAuth поток
   → Извлекаем токены из финального ответа callback
   ```

3. **Calendar API** (Используем JWT из OAuth)
   ```
   GET http://localhost:8000/calendar/calendars
   Заголовки: Authorization: Bearer <ваш_jwt_token>
   
   GET http://localhost:8000/calendar/events?calendarId=primary
   Заголовки: Authorization: Bearer <ваш_jwt_token>
   ```

4. **Управление токенами**
   ```
   POST http://localhost:8000/auth/refresh
   Заголовки: Content-Type: application/json
   Тело: { "refreshToken": "ваш_refresh_token" }
   ```

## Переменные окружения

Необходимые переменные окружения в `.env`:
- `PORT` - Порт сервера (по умолчанию: 8000)
- `DATABASE_URL` - Строка подключения PostgreSQL
- `JWT_SECRET` - Секрет для подписи JWT
- `JWT_REFRESH_SECRET` - Секрет для подписи refresh токенов
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_REDIRECT_URI` - URI перенаправления OAuth
- `FRONTEND_URL` - URL frontend для CORS

## Обработка ошибок

- **401 Unauthorized** - Недействительный или истекший JWT токен
- **403 Forbidden** - Недействительный refresh токен
- **500 Internal Server Error** - Ошибки Google API или базы данных

## Примечания по безопасности

- Google OAuth токены хранятся в базе данных
- JWT токены используются для управления сессиями
- CORS настроен для связи с frontend
- Helmet.js обеспечивает заголовки безопасности
- Ограничение скорости запросов не реализовано (стоит добавить)

## Порядок запуска для разработки

1. Установить зависимости: `pnpm install`
2. Сгенерировать Prisma клиент: `pnpm run db:generate`
3. Запустить сервер разработки: `pnpm run dev`
4. Сервер будет доступен на http://localhost:8000

## Структура проекта

```
src/
├── controllers/     # Контроллеры (пока не используются)
├── lib/
│   └── prisma.ts   # Настройка Prisma клиента
├── middleware/
│   ├── auth.ts     # JWT аутентификация
│   ├── errorHandler.ts # Обработка ошибок
│   └── validation.ts   # Валидация запросов
├── routes/
│   ├── auth.ts     # Маршруты аутентификации
│   ├── calendar.ts # Маршруты календаря
│   └── hello.ts    # Тестовый маршрут
├── types/
│   └── express.d.ts # Типы для Express
├── utils/
│   ├── googleAuth.ts # Утилиты Google Auth
│   └── jwt.ts        # Утилиты JWT
└── index.ts          # Главный файл приложения
```