import { Pool, PoolConfig } from 'pg';
import { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } from '../const';

// Конфигурация PostgreSQL
export interface DatabaseConfig extends PoolConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export const databaseConfig: DatabaseConfig = {
  host: DB_HOST || 'localhost',
  port: parseInt(DB_PORT || '5432'),
  database: DB_NAME || 'nailmasters',
  user: DB_USER || 'postgres',
  password: DB_PASSWORD || 'password',
  max: 20, // максимальное количество соединений в пуле
  idleTimeoutMillis: 30000, // время ожидания перед закрытием неактивного соединения
  connectionTimeoutMillis: 2000, // время ожидания подключения
};

// Создание пула соединений
export const pool = new Pool(databaseConfig);

// Подключение к PostgreSQL
export const connectDatabase = async (): Promise<void> => {
  // Режим разработки без реальной БД
  if (process.env.NODE_ENV === 'development' && !process.env.DB_ENABLED) {
    console.log('🗄️  База данных: Режим разработки (без подключения)');
    console.log(`📍 Конфигурация: ${databaseConfig.database} на ${databaseConfig.host}:${databaseConfig.port}`);
    console.log('💡 Для подключения к реальной БД установите DB_ENABLED=true в .env');
    return;
  }

  try {
    const client = await pool.connect();
    console.log('🗄️  PostgreSQL: Подключение успешно установлено');
    console.log(`📍 База данных: ${databaseConfig.database} на ${databaseConfig.host}:${databaseConfig.port}`);
    
    // Проверяем подключение
    const result = await client.query('SELECT NOW()');
    console.log('⏰ Время сервера БД:', result.rows[0].now);
    
    client.release();
  } catch (error) {
    console.error('❌ Ошибка подключения к PostgreSQL:', error);
    console.log('💡 Проверьте настройки БД в .env файле');
    console.log('💡 Или установите DB_ENABLED=false для работы без БД');
    process.exit(1);
  }
};

// Graceful shutdown
export const closeDatabase = async (): Promise<void> => {
  if (process.env.NODE_ENV === 'development' && !process.env.DB_ENABLED) {
    console.log('🔒 База данных: Режим разработки (нет соединений для закрытия)');
    return;
  }

  try {
    await pool.end();
    console.log('🔒 PostgreSQL: Соединения закрыты');
  } catch (error) {
    console.error('❌ Ошибка при закрытии соединений:', error);
  }
}; 