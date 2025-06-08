# 🗄️ База данных и миграции

Этот проект использует **TypeORM** для работы с PostgreSQL базой данных.

## 📋 Содержание

- [Настройка](#настройка)
- [Сущности](#сущности)
- [Миграции](#миграции)
- [CLI команды](#cli-команды)
- [Примеры использования](#примеры-использования)

## ⚙️ Настройка

### Переменные окружения

Создайте файл `.env` с настройками базы данных:

```env
# База данных
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nailmasters
DB_USER=postgres
DB_PASSWORD=your_password
DB_ENABLED=true

# Для разработки без БД
# DB_ENABLED=false
```

### Установка PostgreSQL

```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Скачайте с https://www.postgresql.org/download/windows/
```

## 🏗️ Сущности

### Основные сущности

- **User** - Базовая информация о пользователе
- **Client** - Профиль клиента
- **Master** - Профиль мастера
- **Design** - Дизайны ногтей
- **Booking** - Записи к мастерам

### Структура базы данных

```
users
├── id (UUID, PK)
├── email (VARCHAR, UNIQUE)
├── password_hash (VARCHAR)
├── name (VARCHAR)
├── phone (VARCHAR)
├── type (ENUM: client, master, admin)
├── is_active (BOOLEAN)
├── last_login_at (TIMESTAMP)
├── avatar_url (VARCHAR)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

clients
├── id (UUID, PK)
├── user_id (UUID, FK -> users.id)
├── location (VARCHAR)
├── preferences (TEXT)
├── favorite_styles (JSON)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

masters
├── id (UUID, PK)
├── user_id (UUID, FK -> users.id)
├── location (VARCHAR)
├── specialties (JSON)
├── rating (DECIMAL)
├── reviews_count (INTEGER)
├── description (TEXT)
├── work_schedule (JSON)
├── portfolio_images (JSON)
├── is_verified (BOOLEAN)
├── base_price (DECIMAL)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

designs
├── id (UUID, PK)
├── master_id (UUID, FK -> masters.id)
├── title (VARCHAR)
├── description (TEXT)
├── category (ENUM)
├── difficulty (ENUM)
├── image_urls (JSON)
├── tags (JSON)
├── price (DECIMAL)
├── duration_minutes (INTEGER)
├── is_active (BOOLEAN)
├── views_count (INTEGER)
├── likes_count (INTEGER)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

bookings
├── id (UUID, PK)
├── client_id (UUID, FK -> clients.id)
├── master_id (UUID, FK -> masters.id)
├── design_id (UUID, FK -> designs.id)
├── scheduled_at (TIMESTAMP)
├── duration_minutes (INTEGER)
├── status (ENUM)
├── price (DECIMAL)
├── notes (TEXT)
├── cancellation_reason (TEXT)
├── confirmed_at (TIMESTAMP)
├── completed_at (TIMESTAMP)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 🔄 Миграции

### Создание миграций

```bash
# Автогенерация миграции на основе изменений в сущностях
npm run migration:generate src/migrations/MigrationName

# Создание пустой миграции
npm run migration:create src/migrations/MigrationName
```

### Управление миграциями

```bash
# Запуск всех ожидающих миграций
npm run migration:run

# Откат последней миграции
npm run migration:revert

# Показать статус миграций
npm run migration:show
```

## 🛠️ CLI команды

Используйте удобный CLI для управления базой данных:

```bash
# Показать справку
npm run db

# Запустить миграции
npm run db run

# Показать статус миграций
npm run db show
npm run db status

# Откатить последнюю миграцию
npm run db revert

# Проверить подключение к БД
npm run db check

# Только для разработки:
npm run db sync    # Синхронизировать схему
npm run db drop    # Очистить базу данных
```

## 📝 Примеры использования

### Работа с сущностями

```typescript
import { AppDataSource } from '../config/typeorm';
import { User, UserType } from '../entities/User';
import { Client } from '../entities/Client';

// Получение репозитория
const userRepository = AppDataSource.getRepository(User);
const clientRepository = AppDataSource.getRepository(Client);

// Создание пользователя
const user = new User();
user.email = 'client@example.com';
user.name = 'Анна Иванова';
user.phone = '+7 999 123-45-67';
user.type = UserType.CLIENT;
user.passwordHash = 'hashed_password';

await userRepository.save(user);

// Создание клиента
const client = new Client();
client.user = user;
client.location = 'Москва';
client.preferences = 'Предпочитает яркие цвета';

await clientRepository.save(client);

// Поиск с отношениями
const userWithClient = await userRepository.findOne({
  where: { id: user.id },
  relations: ['client']
});

// Сложные запросы
const masters = await AppDataSource
  .getRepository(Master)
  .createQueryBuilder('master')
  .leftJoinAndSelect('master.user', 'user')
  .where('master.rating > :rating', { rating: 4.0 })
  .andWhere('master.location = :location', { location: 'Москва' })
  .orderBy('master.rating', 'DESC')
  .getMany();
```

### Транзакции

```typescript
import { AppDataSource } from '../config/typeorm';

await AppDataSource.transaction(async manager => {
  // Создание пользователя
  const user = manager.create(User, {
    email: 'master@example.com',
    name: 'Мария Петрова',
    type: UserType.MASTER,
    // ... другие поля
  });
  await manager.save(user);

  // Создание мастера
  const master = manager.create(Master, {
    user: user,
    location: 'Санкт-Петербург',
    specialties: ['маникюр', 'педикюр'],
    // ... другие поля
  });
  await manager.save(master);
});
```

### Кастомные запросы

```typescript
// Raw SQL запрос
const result = await AppDataSource.query(`
  SELECT m.*, u.name, u.email 
  FROM masters m 
  JOIN users u ON m.user_id = u.id 
  WHERE m.rating > $1 
  ORDER BY m.rating DESC
`, [4.0]);

// Query Builder
const topMasters = await AppDataSource
  .createQueryBuilder()
  .select([
    'master.id',
    'master.rating',
    'master.reviewsCount',
    'user.name',
    'user.email'
  ])
  .from(Master, 'master')
  .leftJoin('master.user', 'user')
  .where('master.rating >= :minRating', { minRating: 4.5 })
  .orderBy('master.rating', 'DESC')
  .limit(10)
  .getRawMany();
```

## 🔧 Разработка

### Добавление новой сущности

1. Создайте файл сущности в `src/entities/`
2. Добавьте декораторы TypeORM
3. Сгенерируйте миграцию: `npm run migration:generate src/migrations/AddNewEntity`
4. Запустите миграцию: `npm run db run`

### Изменение существующей сущности

1. Измените сущность в `src/entities/`
2. Сгенерируйте миграцию: `npm run migration:generate src/migrations/UpdateEntity`
3. Проверьте сгенерированную миграцию
4. Запустите миграцию: `npm run db run`

## ⚠️ Важные замечания

- **Никогда не используйте `synchronize: true` в продакшене!**
- Всегда проверяйте сгенерированные миграции перед запуском
- Делайте бэкапы базы данных перед важными изменениями
- Используйте транзакции для связанных операций
- В продакшене команды `sync` и `drop` заблокированы

## 🚀 Продакшен

### Настройка для продакшена

```env
NODE_ENV=production
DB_HOST=your-production-host
DB_PORT=5432
DB_NAME=nailmasters_prod
DB_USER=nailmasters_user
DB_PASSWORD=secure_password
```

### Запуск миграций в продакшене

```bash
# Проверить статус
npm run db show

# Запустить миграции
npm run db run

# Проверить подключение
npm run db check
```

## 📚 Дополнительные ресурсы

- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeORM Migrations Guide](https://typeorm.io/migrations) 