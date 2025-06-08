# API Бронирований

## Обзор

API для работы с бронированиями услуг маникюра, включая создание, подтверждение, отклонение и управление записями.

## Эндпоинты

### Создание и управление бронированиями

#### POST /bookings
Создание нового бронирования (требует авторизации)

**Тело запроса:**
```json
{
  "designId": "uuid",
  "masterId": "uuid", 
  "scheduledAt": "2024-01-20T14:00:00Z",
  "durationMinutes": 90,
  "notes": "Дополнительные пожелания"
}
```

**Ответ:**
```json
{
  "id": "uuid",
  "clientId": "uuid",
  "masterId": "uuid",
  "designId": "uuid",
  "scheduledAt": "2024-01-20T14:00:00Z",
  "durationMinutes": 90,
  "price": 2000,
  "notes": "Дополнительные пожелания",
  "status": "pending",
  "responseDeadline": "2024-01-15T10:35:00Z",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### GET /bookings/me
Получение бронирований текущего пользователя (требует авторизации)

**Параметры запроса:**
- `status` (string, optional) - Фильтр по статусу (pending, confirmed, rejected, cancelled, completed, no_show)
- `page` (number, optional) - Номер страницы (по умолчанию: 1)
- `limit` (number, optional) - Количество элементов на странице (по умолчанию: 20)

**Ответ для клиента:**
```json
{
  "bookings": [
    {
      "id": "uuid",
      "scheduledAt": "2024-01-20T14:00:00Z",
      "durationMinutes": 90,
      "price": 2000,
      "status": "confirmed",
      "notes": "Дополнительные пожелания",
      "confirmedAt": "2024-01-15T10:32:00Z",
      "master": {
        "id": "uuid",
        "rating": 4.8,
        "location": "Москва",
        "user": {
          "name": "Мария Петрова",
          "phone": "+7 999 123-45-67",
          "avatarUrl": "url"
        }
      },
      "design": {
        "id": "uuid",
        "title": "Французский маникюр",
        "imageUrls": ["url1", "url2"]
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

**Ответ для мастера:**
```json
{
  "bookings": [
    {
      "id": "uuid",
      "scheduledAt": "2024-01-20T14:00:00Z",
      "durationMinutes": 90,
      "price": 2000,
      "status": "pending",
      "notes": "Дополнительные пожелания",
      "responseDeadline": "2024-01-15T10:35:00Z",
      "client": {
        "id": "uuid",
        "user": {
          "name": "Анна Иванова",
          "phone": "+7 999 987-65-43",
          "avatarUrl": "url"
        }
      },
      "design": {
        "id": "uuid",
        "title": "Французский маникюр",
        "imageUrls": ["url1", "url2"]
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "pages": 1
  }
}
```

### Управление бронированиями мастером

#### PUT /bookings/:id/confirm
Подтверждение бронирования мастером (требует авторизации)

**Ответ:**
```json
{
  "id": "uuid",
  "status": "confirmed",
  "confirmedAt": "2024-01-15T10:32:00Z",
  "scheduledAt": "2024-01-20T14:00:00Z",
  "durationMinutes": 90,
  "price": 2000
}
```

#### PUT /bookings/:id/reject
Отклонение бронирования или предложение альтернативного времени (требует авторизации)

**Тело запроса (отклонение):**
```json
{
  "reason": "Занято в это время"
}
```

**Тело запроса (альтернативное время):**
```json
{
  "alternativeTime": "2024-01-20T16:00:00Z",
  "reason": "Предлагаю другое время"
}
```

**Ответ:**
```json
{
  "id": "uuid",
  "status": "rejected",
  "cancellationReason": "Занято в это время",
  "alternativeTimeProposed": "2024-01-20T16:00:00Z"
}
```

### Отмена и завершение

#### PUT /bookings/:id/cancel
Отмена бронирования (клиентом или мастером, требует авторизации)

**Тело запроса:**
```json
{
  "reason": "Не могу прийти"
}
```

**Ответ:**
```json
{
  "id": "uuid",
  "status": "cancelled",
  "cancellationReason": "Не могу прийти"
}
```

#### PUT /bookings/:id/complete
Завершение бронирования (только мастером, требует авторизации)

**Ответ:**
```json
{
  "id": "uuid",
  "status": "completed",
  "completedAt": "2024-01-20T15:30:00Z"
}
```

## Статусы бронирований

- `pending` - Ожидает ответа мастера
- `confirmed` - Подтверждено мастером
- `rejected` - Отклонено мастером
- `cancelled` - Отменено клиентом или мастером
- `completed` - Завершено
- `no_show` - Клиент не пришел

## Автоматическое управление

### Система автоматического отклонения

Если мастер не отвечает на заявку в течение 5 минут:
1. Бронирование автоматически отклоняется
2. Рейтинг мастера снижается на 5 баллов
3. Клиент получает уведомление с предложением выбрать другого мастера
4. Мастер получает уведомление о снижении рейтинга

### Уведомления

Система автоматически отправляет уведомления:
- Мастеру при новой заявке
- Клиенту при подтверждении/отклонении
- Обеим сторонам при отмене
- Мастеру при снижении рейтинга

## Коды ошибок

- `400` - Неверные параметры запроса
- `401` - Необходима авторизация  
- `403` - Недостаточно прав
- `404` - Бронирование не найдено
- `500` - Внутренняя ошибка сервера

## Примеры использования

### Создание бронирования
```bash
POST /bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "designId": "123e4567-e89b-12d3-a456-426614174000",
  "masterId": "123e4567-e89b-12d3-a456-426614174001",
  "scheduledAt": "2024-01-20T14:00:00Z",
  "durationMinutes": 90,
  "notes": "Хочу яркие цвета"
}
```

### Получение активных бронирований
```bash
GET /bookings/me?status=confirmed
Authorization: Bearer <token>
```

### Подтверждение записи мастером
```bash
PUT /bookings/123e4567-e89b-12d3-a456-426614174002/confirm
Authorization: Bearer <token>
```

### Предложение альтернативного времени
```bash
PUT /bookings/123e4567-e89b-12d3-a456-426614174002/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "alternativeTime": "2024-01-20T16:00:00Z",
  "reason": "Предлагаю время попозже"
}
``` 