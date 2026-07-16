import { app } from './app';
import { startTaskEnrichedConsumer } from './services/kafka.service';
import { Logger } from './middleware/logger';

const PORT = process.env.PORT || 8000;

startTaskEnrichedConsumer().catch(console.error);

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
});
