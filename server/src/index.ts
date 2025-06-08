import 'reflect-metadata'; // Должно быть первым импортом для TypeORM
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase, closeDatabase } from './config/typeorm';
import { MigrationService } from './services/migration.service';
import { FileSystemUtil } from './utils/file-system.util';
import { RatingService } from './services/rating.service';
import apiRouter from './routes/.routes';

// Загрузка переменных окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Разрешаем загрузку медиа с других доменов
})); // Безопасность
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
})); // CORS
app.use(morgan('combined')); // Логирование
app.use(express.json({ limit: '10mb' })); // Парсинг JSON
app.use(express.urlencoded({ extended: true })); // Парсинг URL-encoded

// Статические файлы - раздача медиа контента
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  maxAge: '1y', // Кэширование на 1 год
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Устанавливаем правильные MIME типы
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        res.setHeader('Content-Type', 'image/jpeg');
        break;
      case '.png':
        res.setHeader('Content-Type', 'image/png');
        break;
      case '.gif':
        res.setHeader('Content-Type', 'image/gif');
        break;
      case '.webp':
        res.setHeader('Content-Type', 'image/webp');
        break;
      case '.svg':
        res.setHeader('Content-Type', 'image/svg+xml');
        break;
      case '.mp4':
        res.setHeader('Content-Type', 'video/mp4');
        break;
      case '.webm':
        res.setHeader('Content-Type', 'video/webm');
        break;
      case '.mov':
        res.setHeader('Content-Type', 'video/quicktime');
        break;
    }
    
    // Добавляем заголовки для кэширования
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

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

app.use("/api", apiRouter);

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
    await initializeDatabase();
    
    // Создание необходимых директорий для медиа файлов
    await FileSystemUtil.ensureMediaDirectories();
    
    // Запуск сервиса рейтинга
    const ratingService = new RatingService();
    ratingService.startPeriodicCheck();
    
    // Запуск HTTP сервера
    app.listen(PORT, () => {
      console.log('🚀 Сервер запущен!');
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌍 Окружение: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 CORS: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
      console.log(`📚 API документация: http://localhost:${PORT}/api/docs`);
      console.log(`📖 Swagger UI: http://localhost:${PORT}/api/docs/swagger`);
    });
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
};

// Запуск
startServer();

