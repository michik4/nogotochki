# API Дизайнов Маникюра

## Обзор

API для работы с каталогом дизайнов маникюра, включая просмотр, создание, лайки, комментарии и бронирование.

## Эндпоинты

### Каталог дизайнов

#### GET /designs
Получение каталога дизайнов с фильтрацией и пагинацией

**Параметры запроса:**
- `page` (number, optional) - Номер страницы (по умолчанию: 1)
- `limit` (number, optional) - Количество элементов на странице (по умолчанию: 20)
- `category` (string, optional) - Категория дизайна (manicure, pedicure, nail_art, extension, repair)
- `difficulty` (string, optional) - Сложность (easy, medium, hard, expert)
- `search` (string, optional) - Поиск по названию, описанию или тегам
- `sortBy` (string, optional) - Поле для сортировки (createdAt, likesCount, viewsCount, title)
- `sortOrder` (string, optional) - Порядок сортировки (ASC, DESC)
- `isBaseCatalog` (boolean, optional) - Фильтр базового каталога
- `latitude` (number, optional) - Широта для геофильтра
- `longitude` (number, optional) - Долгота для геофильтра
- `radius` (number, optional) - Радиус поиска в км (по умолчанию: 50)

**Ответ:**
```json
{
  "designs": [
    {
      "id": "uuid",
      "title": "Французский маникюр",
      "description": "Классический французский маникюр",
      "category": "manicure",
      "difficulty": "easy",
      "imageUrls": ["url1", "url2"],
      "videoUrls": ["url1"],
      "tags": ["классика", "французский"],
      "price": 1500,
      "durationMinutes": 60,
      "likesCount": 25,
      "viewsCount": 150,
      "isBaseCatalog": true,
      "master": {
        "id": "uuid",
        "user": {
          "name": "Мария Петрова"
        }
      },
      "author": {
        "name": "Анна Иванова"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### GET /designs/:id
Получение дизайна по ID

**Ответ:**
```json
{
  "id": "uuid",
  "title": "Французский маникюр",
  "description": "Классический французский маникюр",
  "category": "manicure",
  "difficulty": "easy",
  "imageUrls": ["url1", "url2"],
  "videoUrls": ["url1"],
  "tags": ["классика", "французский"],
  "price": 1500,
  "durationMinutes": 60,
  "likesCount": 25,
  "viewsCount": 151,
  "isLiked": true,
  "master": {
    "id": "uuid",
    "user": {
      "name": "Мария Петрова"
    }
  },
  "author": {
    "name": "Анна Иванова"
  }
}
```

#### POST /designs
Создание нового дизайна (требует авторизации)

**Тело запроса:**
```json
{
  "title": "Новый дизайн",
  "description": "Описание дизайна",
  "category": "manicure",
  "difficulty": "medium",
  "imageUrls": ["url1", "url2"],
  "videoUrls": ["url1"],
  "tags": ["тег1", "тег2"],
  "price": 2000,
  "durationMinutes": 90,
  "isBaseCatalog": false
}
```

### Лайки

#### POST /designs/:id/like
Лайк/дизлайк дизайна (требует авторизации)

**Ответ:**
```json
{
  "liked": true,
  "likesCount": 26
}
```

#### GET /designs/favorites
Получение избранных дизайнов пользователя (требует авторизации)

### Мастера для дизайна

#### GET /designs/:id/masters
Получение мастеров, которые могут выполнить дизайн

**Параметры запроса:**
- `latitude` (number, optional) - Широта для геофильтра
- `longitude` (number, optional) - Долгота для геофильтра
- `radius` (number, optional) - Радиус поиска в км (по умолчанию: 50)

**Ответ:**
```json
[
  {
    "id": "uuid",
    "designId": "uuid",
    "masterId": "uuid",
    "price": 1800,
    "durationMinutes": 75,
    "isAvailable": true,
    "master": {
      "id": "uuid",
      "rating": 4.8,
      "location": "Москва",
      "user": {
        "name": "Мария Петрова",
        "phone": "+7 999 123-45-67"
      }
    }
  }
]
```

#### POST /designs/:id/add-to-catalog
Мастер добавляет дизайн в свой каталог (требует авторизации)

**Тело запроса:**
```json
{
  "price": 1800,
  "durationMinutes": 75,
  "notes": "Дополнительные заметки"
}
```

### Комментарии

#### GET /designs/:id/comments
Получение комментариев к дизайну

**Параметры запроса:**
- `page` (number, optional) - Номер страницы
- `limit` (number, optional) - Количество элементов на странице

**Ответ:**
```json
{
  "comments": [
    {
      "id": "uuid",
      "content": "Очень красивый дизайн!",
      "likesCount": 5,
      "createdAt": "2024-01-15T10:30:00Z",
      "user": {
        "name": "Анна Иванова",
        "avatarUrl": "url"
      },
      "answer": {
        "id": "uuid",
        "content": "Спасибо за отзыв!",
        "createdAt": "2024-01-15T11:00:00Z",
        "user": {
          "name": "Мария Петрова"
        }
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

#### POST /designs/:id/comments
Создание комментария (требует авторизации)

**Тело запроса:**
```json
{
  "content": "Отличный дизайн!"
}
```

#### PUT /designs/:id/comments/:commentId
Обновление комментария (требует авторизации)

#### DELETE /designs/:id/comments/:commentId
Удаление комментария (требует авторизации)

### Ответы на комментарии

#### GET /designs/:id/comments/:commentId/answer
Получение ответа на комментарий

#### POST /designs/:id/comments/:commentId/answer
Создание ответа на комментарий (требует авторизации)

**Тело запроса:**
```json
{
  "content": "Спасибо за отзыв!"
}
```

#### PUT /designs/:id/comments/:commentId/answer
Обновление ответа на комментарий (требует авторизации)

#### DELETE /designs/:id/comments/:commentId/answer
Удаление ответа на комментарий (требует авторизации)

## Коды ошибок

- `400` - Неверные параметры запроса
- `401` - Необходима авторизация
- `403` - Недостаточно прав
- `404` - Ресурс не найден
- `500` - Внутренняя ошибка сервера

## Примеры использования

### Поиск дизайнов рядом с пользователем
```
GET /designs?latitude=55.7558&longitude=37.6176&radius=10&category=manicure
```

### Получение популярных дизайнов
```
GET /designs?sortBy=likesCount&sortOrder=DESC&limit=10
```

### Поиск по тегам
```
GET /designs?search=французский&category=manicure
``` 