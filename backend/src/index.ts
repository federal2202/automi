import express from 'express';
  import cors from 'cors';
  import helmet from 'helmet';
  import morgan from 'morgan';
  import { config } from 'dotenv';
  import authRoutes from './routes/auth';      
  import calendarRoutes from './routes/calendar';
  import { errorHandler } from './middleware/errorHandler';

  config();

  const app = express();
  const PORT = process.env.PORT || 8000;

  // Middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(morgan('combined'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Routes                                    
  app.use('/auth', authRoutes);
  app.use('/calendar', calendarRoutes);

  // Health check (уже есть)
  app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok' });
  })

  // Global error handler
  app.use(errorHandler);

  app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📅 Calendar API: 
  http://localhost:${PORT}/calendar`);
      console.log(`🔐 Auth: 
  http://localhost:${PORT}/auth/google`);
  })