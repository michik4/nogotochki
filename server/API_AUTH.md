# API Аутентификации NailMasters

## 🔐 Обзор

Система аутентификации основана на JWT токенах с поддержкой refresh токенов для безопасного обновления сессий.

## 📋 Endpoints

### 1. Регистрация пользователя

**POST** `/api/auth/register`

Создание нового аккаунта пользователя.

#### Тело запроса:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "Имя Пользователя",
  "phone": "+7 (999) 123-45-67",
  "type": "client", // или "master"
  "location": "Москва", // опционально
  "specialties": ["Гель-лак", "Дизайн"] // только для мастеров
}
```

#### Успешный ответ (201):
```json
{
  "message": "Пользователь успешно зарегистрирован",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Имя Пользователя",
    "phone": "+7 (999) 123-45-67",
    "type": "client",
    "location": "Москва",
    "is_active": true,
    "email_verified": false,
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "success": true
}
```

#### Ошибки:
- **400** - Некорректные данные
- **409** - Пользователь уже существует

---

### 2. Вход в систему

**POST** `/api/auth/login`

Аутентификация существующего пользователя.

#### Тело запроса:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Успешный ответ (200):
```json
{
  "message": "Успешный вход в систему",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Имя Пользователя",
    "type": "client",
    // ... дополнительные поля в зависимости от типа
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "success": true
}
```

#### Ошибки:
- **400** - Отсутствуют обязательные поля
- **401** - Неверные учетные данные

---

### 3. Получение текущего пользователя

**GET** `/api/auth/me`

Получение информации о текущем аутентифицированном пользователе.

#### Заголовки:
```
Authorization: Bearer <accessToken>
```

#### Успешный ответ (200):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Имя Пользователя",
    "type": "client",
    // ... полный профиль пользователя
  },
  "success": true
}
```

#### Ошибки:
- **401** - Токен отсутствует или недействителен
- **404** - Пользователь не найден

---

### 4. Обновление токена

**POST** `/api/auth/refresh`

Обновление access токена с помощью refresh токена.

#### Тело запроса:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Успешный ответ (200):
```json
{
  "message": "Токены успешно обновлены",
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "success": true
}
```

#### Ошибки:
- **400** - Refresh token отсутствует
- **401** - Недействительный refresh token

---

### 5. Выход из системы

**POST** `/api/auth/logout`

Завершение сессии пользователя.

#### Успешный ответ (200):
```json
{
  "message": "Успешный выход из системы",
  "success": true
}
```

---

## 🔑 JWT Токены

### Структура токена:

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "type": "client",
  "iat": 1640995200,
  "exp": 1643587200,
  "iss": "nailmasters-api",
  "aud": "nailmasters-client"
}
```

### Время жизни:
- **Access Token**: 30 дней (настраивается)
- **Refresh Token**: 90 дней

### Использование:
Добавьте access token в заголовок Authorization:
```
Authorization: Bearer <accessToken>
```

---

## 🛡️ Безопасность

### Валидация пароля:
- Минимум 8 символов
- Максимум 128 символов
- Должен содержать цифры
- Должен содержать буквы

### Хеширование:
- Алгоритм: bcrypt
- Раунды: 12

### Защита:
- Пароли никогда не возвращаются в ответах
- JWT подписываются секретным ключом
- Проверка существования пользователя при каждом запросе

---

## 📝 Коды ошибок

| Код | Описание |
|-----|----------|
| `MISSING_REQUIRED_FIELDS` | Отсутствуют обязательные поля |
| `INVALID_EMAIL` | Некорректный формат email |
| `INVALID_PASSWORD` | Пароль не соответствует требованиям |
| `INVALID_USER_TYPE` | Недопустимый тип пользователя |
| `USER_ALREADY_EXISTS` | Пользователь уже существует |
| `MISSING_CREDENTIALS` | Отсутствуют учетные данные |
| `INVALID_CREDENTIALS` | Неверные учетные данные |
| `NOT_AUTHENTICATED` | Пользователь не аутентифицирован |
| `NO_TOKEN` | Токен не предоставлен |
| `INVALID_TOKEN` | Недействительный токен |
| `USER_NOT_FOUND` | Пользователь не найден |
| `MISSING_REFRESH_TOKEN` | Отсутствует refresh token |
| `INVALID_REFRESH_TOKEN` | Недействительный refresh token |
| `INTERNAL_SERVER_ERROR` | Внутренняя ошибка сервера |

---

## 🧪 Примеры использования

### JavaScript/TypeScript:

```javascript
// Регистрация
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securePassword123',
    name: 'Имя Пользователя',
    phone: '+7 (999) 123-45-67',
    type: 'client'
  })
});

const { user, tokens } = await registerResponse.json();

// Сохранение токенов
localStorage.setItem('accessToken', tokens.accessToken);
localStorage.setItem('refreshToken', tokens.refreshToken);

// Аутентифицированный запрос
const profileResponse = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
});
```

### cURL:

```bash
# Регистрация
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "Имя Пользователя",
    "phone": "+7 (999) 123-45-67",
    "type": "client"
  }'

# Вход
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'

# Получение профиля
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <accessToken>"
``` 