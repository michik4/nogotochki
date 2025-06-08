import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'nailmasters',
  
  // Пути к сущностям и миграциям для CLI
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
  
  // Настройки для CLI
  synchronize: false, // Отключаем автосинхронизацию для миграций
  logging: ['query', 'error'],
  
  // Дополнительные настройки
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
}); 