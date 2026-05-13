import express from 'express';
  import cors from 'cors';
  import helmet from 'helmet';
  import morgan from 'morgan';
  import cookieParser from 'cookie-parser';
  import { config } from 'dotenv';
  import authRoutes from './routes/auth';      
  import calendarRoutes from './routes/calendar';
  import aiRoutes from './routes/tasks';
  import periodsRoutes from './routes/periods';

  import { errorHandler } from './middleware/errorHandler';
  import { requestLogger, Logger } from './middleware/logger';

  config();

  const app = express();
  const PORT = process.env.PORT || 8000;

  // Middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(morgan('combined'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  
  // Enhanced request logging
  app.use(requestLogger);

  // Routes                                    
  app.use('/auth', authRoutes);
  app.use('/calendar', calendarRoutes);
  app.use('/tasks', aiRoutes);
  app.use('/periods', periodsRoutes);


  // Health check (уже есть)
  app.get('/health', (_req, res) => {
      res.status(200).json({ status: 'ok' });
  })

  // Global error handler
  app.use(errorHandler);

  app.listen(PORT, () => {
      Logger.info('Server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV,
        endpoints: {
          health: `http://localhost:${PORT}/health`,
          auth: `http://localhost:${PORT}/auth/google`,
          calendar: `http://localhost:${PORT}/calendar`,
          callback: `http://localhost:${PORT}/auth/google/callback`
        }
      });
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📅 Calendar API: http://localhost:${PORT}/calendar`);
      console.log(`🔐 Auth: http://localhost:${PORT}/auth/google`);
      console.log(`📞 Callback: http://localhost:${PORT}/auth/google/callback`);
  })