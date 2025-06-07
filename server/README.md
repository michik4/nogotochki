# NailMasters Server

Серверная часть приложения NailMasters на Node.js + TypeScript + PostgreSQL.

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ 
- PostgreSQL 14+
- npm или yarn

### Установка

1. **Клонирование и установка зависимостей:**
```bash
cd server
npm install
```

2. **Настройка базы данных:**
```bash
# Создайте базу данных PostgreSQL
createdb nailmasters

# Выполните SQL схему
psql -d nailmasters -f src/config/schema.sql
```

3. **Настройка переменных окружения:**
```bash
# Скопируйте .env и настройте под свою БД
cp .env .env.local

# Отредактируйте .env.local:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nailmasters
DB_USER=your_username
DB_PASSWORD=your_password
```

4. **Запуск в режиме разработки:**
```bash
npm run dev
```

Сервер будет доступен по адресу: http://localhost:3000

## 📁 Структура проекта

```
server/
├── src/
│   ├── config/          # Конфигурация (БД, настройки)
│   │   ├── database.ts  # Подключение к PostgreSQL
│   │   └── schema.sql   # SQL схема БД
│   ├── controllers/     # Контроллеры API
│   ├── middleware/      # Middleware (auth, validation)
│   ├── models/          # Модели данных
│   │   └── User.ts      # Модель пользователя
│   ├── routes/          # Маршруты API
│   ├── utils/           # Утилиты
│   └── index.ts         # Точка входа
├── .env                 # Переменные окружения
├── package.json
├── tsconfig.json
├── nodemon.json
└── README.md
```

## 🗄️ База данных

### Основные таблицы:

- **users** - Пользователи (клиенты, мастера, админы)
- **clients** - Дополнительные данные клиентов
- **masters** - Дополнительные данные мастеров
- **designs** - Дизайны ногтей
- **bookings** - Записи к мастерам
- **favorites** - Избранные дизайны
- **uploads** - Загруженные фото/видео
- **reviews** - Отзывы

### Типы пользователей:

- `client` - Клиент
- `master` - Мастер маникюра
- `admin` - Администратор

## 🔧 Скрипты

```bash
npm run dev      # Запуск в режиме разработки
npm run build    # Сборка TypeScript
npm start        # Запуск продакшн версии
npm run clean    # Очистка папки dist
```

## 🌐 API Endpoints

### Базовые маршруты:
- `GET /` - Информация о сервере
- `GET /health` - Проверка состояния

### API маршруты (в разработке):
- `POST /api/auth/login` - Вход
- `POST /api/auth/register` - Регистрация
- `GET /api/users/profile` - Профиль пользователя
- `GET /api/designs` - Список дизайнов
- `POST /api/bookings` - Создание записи

## 🔐 Аутентификация

Используется JWT токены для аутентификации:
- Токены хранятся в HTTP-only cookies
- Время жизни токена: 7 дней (настраивается)
- Пароли хешируются с помощью bcrypt

## 🛡️ Безопасность

- **Helmet** - Защита HTTP заголовков
- **CORS** - Настройка разрешенных источников
- **Rate limiting** - Ограничение запросов (планируется)
- **Input validation** - Валидация входных данных (планируется)

## 📊 Мониторинг

- **Morgan** - Логирование HTTP запросов
- **Health check** - Проверка состояния сервера
- **Graceful shutdown** - Корректное завершение работы

## 🚀 Развертывание

### Docker (планируется):
```bash
docker build -t nailmasters-server .
docker run -p 3000:3000 nailmasters-server
```

### Переменные окружения для продакшн:
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-super-secret-key
CORS_ORIGIN=https://yourdomain.com
```

## 🔄 Статус разработки

- ✅ Базовая настройка сервера
- ✅ Подключение к PostgreSQL
- ✅ Структура проекта
- ✅ SQL схема
- 🔄 API маршруты аутентификации
- 🔄 CRUD операции
- 🔄 Middleware валидации
- ⏳ Тестирование
- ⏳ Документация API
- ⏳ Docker контейнеризация

## 🤝 Разработка

Для добавления новых функций:

1. Создайте ветку: `git checkout -b feature/new-feature`
2. Добавьте изменения
3. Запустите тесты: `npm test`
4. Создайте Pull Request

## 📝 Лицензия

ISC License 