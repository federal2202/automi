import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { config } from 'dotenv';
import sseRoutes from './routes/sse';
import authRoutes from './routes/auth';
import calendarRoutes from './routes/calendar';
import aiRoutes from './routes/tasks';
import periodsRoutes from './routes/periods';
import meRoutes from './routes/me';

import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';

config();

// Express app construction only — no app.listen(), no Kafka consumer start.
// Split out so integration tests can `import { app } from '../src/app'` and
// drive it with supertest without opening a real port or a Kafka connection.
export const app = express();

// Behind a reverse proxy (Caddy/nginx) in production: needed for correct
// client IPs (rate limiting) and for Secure cookies to be recognised.
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
// The largest legitimate body here is a calendar event with a long
// description or a /tasks/generate prompt (capped at 4000 chars) — 10mb was
// a needless DoS-by-payload surface.
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true, limit: '256kb' }));
app.use(cookieParser());

// Enhanced request logging
app.use(requestLogger);

// Rate limiting. A broad limiter protects the whole API; a stricter one
// guards the auth endpoints against brute force. (BUG-8: express-rate-limit
// was installed but never wired up.)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  // SSE holds a long-lived connection and reconnects; don't rate-limit it or
  // the health check.
  skip: (req) => req.path === '/health' || req.path.startsWith('/sse'),
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(apiLimiter);

// Routes
app.use('/auth', authLimiter, authRoutes);
app.use('/calendar', calendarRoutes);
app.use('/tasks', aiRoutes);
app.use('/periods', periodsRoutes);
app.use('/me', meRoutes);
app.use('/sse', sseRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Global error handler
app.use(errorHandler);
