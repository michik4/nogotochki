import { DataSource } from 'typeorm';
import { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } from '../const';

// Импорт всех сущностей
import { User } from '../entities/User';
import { Client } from '../entities/Client';
import { Master } from '../entities/Master';
import { Design } from '../entities/Design';
import { Booking } from '../entities/Booking';
import { Media } from '../entities/Media.entity';
import { Comment } from '../entities/Comment';
import { Like } from '../entities/Like';
import { MasterDesign } from '../entities/MasterDesign';
import { Notification } from '../entities/Notification';

// Конфигурация TypeORM
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST || 'localhost',
  port: parseInt(DB_PORT || '5432'),
  username: DB_USER || 'postgres',
  password: DB_PASSWORD || 'password',
  database: DB_NAME || 'nailmasters',
  
  // Сущности
  entities: [
    User,
    Client,
    Master,
    Design,
    Booking,
    Media,
    Comment,
    Like,
    MasterDesign,
    Notification
  ],
  
  // Настройки
  synchronize: process.env.NODE_ENV === 'development', // Только для разработки
  logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  
  // Дополнительные настройки
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
});

// Инициализация подключения
export const initializeDatabase = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('🗄️  TypeORM: Подключение успешно установлено');
      console.log(`📍 База данных: ${DB_NAME} на ${DB_HOST}:${DB_PORT}`);
    }
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error);
    process.exit(1);
  }
};

// Закрытие подключения
export const closeDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔒 TypeORM: Соединение закрыто');
    }
  } catch (error) {
    console.error('❌ Ошибка при закрытии соединения:', error);
  }
}; 