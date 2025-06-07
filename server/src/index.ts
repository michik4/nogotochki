import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDatabase, closeDatabase } from './config/database';

// Загрузка переменных окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Безопасность
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
})); // CORS
app.use(morgan('combined')); // Логирование
app.use(express.json({ limit: '10mb' })); // Парсинг JSON
app.use(express.urlencoded({ extended: true })); // Парсинг URL-encoded

// Базовый маршрут
app.get('/', (req, res) => {
  res.json({
    message: '🎨 NailMasters API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API маршруты (будут добавлены позже)
app.use('/api/auth', (req, res) => {
  res.json({ message: 'Auth routes - в разработке' });
});

app.use('/api/users', (req, res) => {
  res.json({ message: 'User routes - в разработке' });
});

app.use('/api/designs', (req, res) => {
  res.json({ message: 'Design routes - в разработке' });
});

app.use('/api/bookings', (req, res) => {
  res.json({ message: 'Booking routes - в разработке' });
});

// 404 обработчик
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Глобальный обработчик ошибок
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Ошибка сервера:', err);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Получен сигнал ${signal}. Завершение работы...`);
  
  try {
    await closeDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при завершении работы:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Запуск сервера
const startServer = async () => {
  try {
    // Подключение к базе данных
    await connectDatabase();
    
    // Запуск HTTP сервера
    app.listen(PORT, () => {
      console.log('🚀 Сервер запущен!');
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌍 Окружение: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 CORS: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
      console.log('📚 API документация будет доступна позже');
    });
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
};

// Запуск
startServer();

