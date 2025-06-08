# API Медиа Контента

Этот документ описывает API для работы с медиа контентом (изображения и видео) в системе NailMasters.

## Обзор

API медиа предоставляет полный набор функций для:
- Загрузки медиа файлов (изображения и видео)
- Автоматической обработки изображений (изменение размера, создание миниатюр)
- Управления метаданными файлов
- Раздачи медиа контента с оптимизацией
- Контроля доступа к файлам

## Базовый URL

```
http://localhost:3000/api/media
```

## Аутентификация

Большинство эндпоинтов требуют JWT токен в заголовке:

```
Authorization: Bearer <your-jwt-token>
```

## Поддерживаемые форматы

### Изображения
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- SVG (.svg)

### Видео
- MP4 (.mp4)
- WebM (.webm)
- QuickTime (.mov)
- AVI (.avi)
- WMV (.wmv)

## Ограничения

- Максимальный размер файла: 100MB
- Максимальное количество файлов за раз: 10
- Поддерживаются только указанные выше форматы

## Эндпоинты

### 1. Загрузка одного файла

**POST** `/upload`

Загружает один медиа файл с возможностью обработки.

#### Параметры (multipart/form-data)

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| file | File | Да | Медиа файл для загрузки |
| category | String | Нет | Категория файла (design, portfolio, avatar, gallery, other) |
| description | String | Нет | Описание файла |
| alt | String | Нет | Альтернативный текст для изображений |
| isPublic | Boolean | Нет | Публичный ли файл (по умолчанию false) |
| generateThumbnail | Boolean | Нет | Создавать ли миниатюру (по умолчанию true) |
| width | Integer | Нет | Ширина для изменения размера |
| height | Integer | Нет | Высота для изменения размера |
| quality | Integer | Нет | Качество сжатия (1-100) |

#### Пример запроса

```bash
curl -X POST http://localhost:3000/api/media/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@image.jpg" \
  -F "category=portfolio" \
  -F "description=Мой дизайн ногтей" \
  -F "isPublic=true"
```

#### Пример ответа

```json
{
  "success": true,
  "message": "Файл успешно загружен",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "filename": "abc123-def456.jpg",
    "originalName": "image.jpg",
    "mimeType": "image/jpeg",
    "size": 1024000,
           "url": "http://localhost:3000/uploads/images/abc123-def456.jpg",
    "type": "image",
    "category": "portfolio",
    "width": 1920,
    "height": 1080,
           "thumbnailUrl": "http://localhost:3000/uploads/thumbnails/thumb_abc123-def456.jpg",
    "description": "Мой дизайн ногтей",
    "isPublic": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Загрузка нескольких файлов

**POST** `/upload-multiple`

Загружает несколько медиа файлов одновременно.

#### Параметры (multipart/form-data)

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| files | File[] | Да | Массив медиа файлов |
| category | String | Нет | Категория для всех файлов |
| isPublic | Boolean | Нет | Публичность для всех файлов |

#### Пример запроса

```bash
curl -X POST http://localhost:3000/api/media/upload-multiple \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@image1.jpg" \
  -F "files=@image2.png" \
  -F "category=gallery" \
  -F "isPublic=true"
```

### 3. Получение списка файлов

**GET** `/`

Получает список медиа файлов с фильтрацией и пагинацией.

#### Параметры запроса

| Параметр | Тип | Описание |
|----------|-----|----------|
| category | String | Фильтр по категории |
| type | String | Фильтр по типу (image, video) |
| isPublic | Boolean | Фильтр по публичности |
| page | Integer | Номер страницы (по умолчанию 1) |
| limit | Integer | Количество элементов на странице (по умолчанию 20) |

#### Пример запроса

```bash
curl "http://localhost:3000/api/media?category=portfolio&type=image&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Пример ответа

```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "filename": "abc123-def456.jpg",
      "originalName": "image.jpg",
      "url": "http://localhost:3000/uploads/images/abc123-def456.jpg",
      "type": "image",
      "category": "portfolio",
      "thumbnailUrl": "http://localhost:3000/uploads/thumbnails/thumb_abc123-def456.jpg",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### 4. Получение информации о файле

**GET** `/{id}`

Получает подробную информацию о конкретном медиа файле.

#### Пример запроса

```bash
curl "http://localhost:3000/api/media/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Обновление информации о файле

**PUT** `/{id}`

Обновляет метаданные медиа файла.

#### Параметры (JSON)

| Параметр | Тип | Описание |
|----------|-----|----------|
| description | String | Новое описание |
| alt | String | Новый альтернативный текст |
| isPublic | Boolean | Новая настройка публичности |
| category | String | Новая категория |

#### Пример запроса

```bash
curl -X PUT "http://localhost:3000/api/media/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Обновленное описание",
    "isPublic": false,
    "category": "design"
  }'
```

### 6. Удаление файла

**DELETE** `/{id}`

Удаляет медиа файл и все связанные с ним данные.

#### Пример запроса

```bash
curl -X DELETE "http://localhost:3000/api/media/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. Раздача медиа файлов

**GET** `/{type}/{filename}`

Раздает медиа файлы с оптимизацией и кэшированием.

#### Параметры пути

| Параметр | Описание |
|----------|----------|
| type | Тип файла (images, videos, thumbnails) |
| filename | Имя файла |

#### Особенности

- Автоматическое определение MIME типа
- Поддержка Range запросов для видео
- Кэширование на 1 год
- Оптимизированная раздача больших файлов

#### Пример запроса

```bash
curl "http://localhost:3000/uploads/images/abc123-def456.jpg"
```

### 8. Статистика медиа файлов

**GET** `/stats`

Получает статистику по медиа файлам пользователя.

#### Пример ответа

```json
{
  "success": true,
  "data": {
    "total": 150,
    "byType": {
      "images": 120,
      "videos": 30
    },
    "byCategory": {
      "design": 50,
      "portfolio": 40,
      "avatar": 5,
      "gallery": 45,
      "other": 10
    }
  }
}
```

### 9. Обновление URL медиа файлов (миграция)

**POST** `/update-urls`

Обновляет URL для всех существующих медиа файлов в базе данных. Используется для миграции со старых URL (`/api/media/`) на новые (`/uploads/`). Этот эндпоинт полезен после изменения структуры URL или при переносе файлов.

#### Требования

- Авторизация обязательна
- Требует права администратора или владельца файлов

#### Пример запроса

```bash
curl -X POST "http://localhost:3000/api/media/update-urls" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Пример ответа

```json
{
  "success": true,
  "message": "Обновлено 15 медиа файлов",
  "data": {
    "updatedCount": 15
  }
}
```

#### Возможные ошибки

- `401` - Не авторизован
- `500` - Внутренняя ошибка сервера

## Категории файлов

| Категория | Описание |
|-----------|----------|
| design | Дизайны ногтей |
| portfolio | Портфолио работ |
| avatar | Аватары пользователей |
| gallery | Галерея изображений |
| other | Прочие файлы |

## Обработка изображений

### Автоматическая обработка

- **Миниатюры**: Автоматически создаются для всех изображений (300x300px)
- **Метаданные**: Извлекаются размеры изображения
- **Оптимизация**: Сжатие JPEG с качеством 80% для миниатюр

### Изменение размера

При загрузке можно указать параметры для изменения размера:

```bash
curl -X POST http://localhost:3000/api/media/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@large-image.jpg" \
  -F "width=1200" \
  -F "height=800" \
  -F "quality=85"
```

## Безопасность

### Контроль доступа

- **Приватные файлы**: Доступны только владельцу
- **Публичные файлы**: Доступны всем пользователям
- **Миниатюры**: Всегда доступны публично

### Валидация

- Проверка типов файлов
- Ограничение размера файлов
- Проверка прав доступа

## Коды ошибок

| Код | Описание |
|-----|----------|
| 400 | Неверный запрос (неподдерживаемый тип файла, слишком большой размер) |
| 401 | Не авторизован |
| 403 | Нет прав доступа |
| 404 | Файл не найден |
| 413 | Файл слишком большой |
| 500 | Внутренняя ошибка сервера |

## Примеры использования

### Загрузка аватара пользователя

```javascript
const formData = new FormData();
formData.append('file', avatarFile);
formData.append('category', 'avatar');
formData.append('width', '200');
formData.append('height', '200');
formData.append('quality', '90');

const response = await fetch('/api/media/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Создание галереи

```javascript
// Загрузка нескольких изображений
const formData = new FormData();
galleryFiles.forEach(file => {
  formData.append('files', file);
});
formData.append('category', 'gallery');
formData.append('isPublic', 'true');

const uploadResponse = await fetch('/api/media/upload-multiple', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

// Получение списка для отображения
const listResponse = await fetch('/api/media?category=gallery&type=image', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Отображение изображения с миниатюрой

```html
<!-- Миниатюра для предварительного просмотра -->
<img src="http://localhost:3000/uploads/thumbnails/thumb_abc123-def456.jpg" 
     alt="Предварительный просмотр" 
     onclick="showFullImage()">

<!-- Полное изображение -->
<img id="fullImage" 
     src="http://localhost:3000/uploads/images/abc123-def456.jpg" 
     alt="Полное изображение" 
     style="display: none;">
```

## Рекомендации

### Производительность

1. **Используйте миниатюры** для предварительного просмотра
2. **Оптимизируйте размеры** изображений перед загрузкой
3. **Используйте пагинацию** при получении списков
4. **Кэшируйте** URL файлов на клиенте

### Пользовательский опыт

1. **Показывайте прогресс** загрузки для больших файлов
2. **Валидируйте файлы** на клиенте перед отправкой
3. **Предоставляйте превью** перед загрузкой
4. **Обрабатывайте ошибки** с понятными сообщениями

### Безопасность

1. **Не полагайтесь** только на клиентскую валидацию
2. **Проверяйте права доступа** перед отображением файлов
3. **Используйте HTTPS** в продакшене
4. **Регулярно очищайте** неиспользуемые файлы