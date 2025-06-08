import swaggerJsdoc from 'swagger-jsdoc';
import { PORT } from '../const';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NailMasters API',
      version: '1.0.0',
      description: 'API для приложения NailMasters - платформы для мастеров маникюра и их клиентов',
      contact: {
        name: 'NailMasters Team',
        email: 'support@nailmasters.ru'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Аутентификация и авторизация'
      },
      {
        name: 'Users',
        description: 'Управление пользователями'
      },
      {
        name: 'Masters',
        description: 'Управление мастерами'
      },
      {
        name: 'Designs',
        description: 'Управление дизайнами'
      },
      {
        name: 'Bookings',
        description: 'Управление записями'
      },
      {
        name: 'Admin',
        description: 'Административные функции'
      },
      {
        name: 'Media',
        description: 'Управление медиа контентом (изображения и видео)'
      },
      {
        name: 'Comments',
        description: 'Управление комментариями к дизайнам'
      },
      {
        name: 'Likes',
        description: 'Управление лайками дизайнов'
      },
      {
        name: 'Notifications',
        description: 'Система уведомлений'
      }
    ],
    servers: [
      {
        url: `http://localhost:${PORT || 3000}/api`,
        description: 'Development server'
      },
      {
        url: 'https://api.nailmasters.ru/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT токен для аутентификации. Формат: Bearer <token>'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Уникальный идентификатор пользователя'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email пользователя'
            },
            name: {
              type: 'string',
              description: 'Имя пользователя'
            },
            phone: {
              type: 'string',
              description: 'Номер телефона'
            },
            type: {
              type: 'string',
              enum: ['client', 'master', 'admin'],
              description: 'Тип пользователя'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Дата последнего обновления'
            }
          }
        },
        Client: {
          allOf: [
            { $ref: '#/components/schemas/User' },
            {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'Местоположение клиента'
                }
              }
            }
          ]
        },
        Master: {
          allOf: [
            { $ref: '#/components/schemas/User' },
            {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'Местоположение мастера'
                },
                latitude: {
                  type: 'number',
                  format: 'float',
                  nullable: true,
                  description: 'Широта местоположения'
                },
                longitude: {
                  type: 'number',
                  format: 'float',
                  nullable: true,
                  description: 'Долгота местоположения'
                },
                specialties: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'Специализации мастера'
                },
                rating: {
                  type: 'number',
                  format: 'float',
                  minimum: 0,
                  maximum: 5,
                  description: 'Рейтинг мастера'
                },
                reviews_count: {
                  type: 'integer',
                  minimum: 0,
                  description: 'Количество отзывов'
                },
                lastResponseAt: {
                  type: 'string',
                  format: 'date-time',
                  nullable: true,
                  description: 'Время последнего ответа на бронирование'
                },
                timeoutCount: {
                  type: 'integer',
                  minimum: 0,
                  description: 'Количество просроченных ответов'
                },
                distance: {
                  type: 'number',
                  format: 'float',
                  nullable: true,
                  description: 'Расстояние от пользователя (в км, только в ответах с геолокацией)'
                }
              }
            }
          ]
        },
        TokenPair: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              description: 'JWT access токен'
            },
            refreshToken: {
              type: 'string',
              description: 'JWT refresh токен'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Сообщение о результате операции'
            },
            user: {
              oneOf: [
                { $ref: '#/components/schemas/Client' },
                { $ref: '#/components/schemas/Master' }
              ]
            },
            tokens: {
              $ref: '#/components/schemas/TokenPair'
            },
            success: {
              type: 'boolean',
              description: 'Статус успешности операции'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Описание ошибки'
            },
            code: {
              type: 'string',
              description: 'Код ошибки'
            },
            details: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Дополнительные детали ошибки'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'name', 'phone', 'role'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email пользователя'
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'Пароль (минимум 8 символов, должен содержать цифры и буквы)'
            },
            name: {
              type: 'string',
              description: 'Имя пользователя'
            },
            phone: {
              type: 'string',
              description: 'Номер телефона'
            },
            role: {
              type: 'string',
              enum: ['client', 'master', 'admin'],
              description: 'Роль пользователя'
            },
            location: {
              type: 'string',
              description: 'Местоположение (опционально)'
            },
            specialties: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Специализации (только для мастеров)'
            },
            rootPassword: {
              type: 'string',
              description: 'Root пароль (обязательно для роли admin)'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email пользователя'
            },
            password: {
              type: 'string',
              description: 'Пароль пользователя'
            }
          }
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              description: 'Refresh токен для обновления'
            }
          }
        },
        Media: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Уникальный идентификатор медиа файла'
            },
            filename: {
              type: 'string',
              description: 'Имя файла в системе'
            },
            originalName: {
              type: 'string',
              description: 'Оригинальное имя файла'
            },
            mimeType: {
              type: 'string',
              description: 'MIME тип файла'
            },
            size: {
              type: 'integer',
              description: 'Размер файла в байтах'
            },
            path: {
              type: 'string',
              description: 'Путь к файлу в файловой системе'
            },
            url: {
              type: 'string',
              description: 'URL для доступа к файлу'
            },
            type: {
              type: 'string',
              enum: ['image', 'video'],
              description: 'Тип медиа файла'
            },
            category: {
              type: 'string',
              enum: ['design', 'portfolio', 'avatar', 'gallery', 'other'],
              description: 'Категория медиа файла'
            },
            width: {
              type: 'integer',
              nullable: true,
              description: 'Ширина изображения/видео в пикселях'
            },
            height: {
              type: 'integer',
              nullable: true,
              description: 'Высота изображения/видео в пикселях'
            },
            duration: {
              type: 'integer',
              nullable: true,
              description: 'Длительность видео в секундах'
            },
            thumbnailPath: {
              type: 'string',
              nullable: true,
              description: 'Путь к файлу миниатюры'
            },
            thumbnailUrl: {
              type: 'string',
              nullable: true,
              description: 'URL миниатюры'
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Описание медиа файла'
            },
            alt: {
              type: 'string',
              nullable: true,
              description: 'Альтернативный текст для изображений'
            },
            isActive: {
              type: 'boolean',
              description: 'Активен ли файл'
            },
            isPublic: {
              type: 'boolean',
              description: 'Публичный ли файл'
            },
            uploadedById: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'ID пользователя, загрузившего файл'
            },
            uploadedBy: {
              $ref: '#/components/schemas/User',
              description: 'Пользователь, загрузивший файл'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата обновления'
            }
          }
        },
        MediaUploadRequest: {
          type: 'object',
          required: ['file'],
          properties: {
            file: {
              type: 'string',
              format: 'binary',
              description: 'Медиа файл для загрузки'
            },
            category: {
              type: 'string',
              enum: ['design', 'portfolio', 'avatar', 'gallery', 'other'],
              description: 'Категория файла'
            },
            description: {
              type: 'string',
              description: 'Описание файла'
            },
            alt: {
              type: 'string',
              description: 'Альтернативный текст для изображений'
            },
            isPublic: {
              type: 'boolean',
              description: 'Публичный ли файл'
            },
            generateThumbnail: {
              type: 'boolean',
              description: 'Создавать ли миниатюру'
            },
            width: {
              type: 'integer',
              description: 'Ширина для изменения размера'
            },
            height: {
              type: 'integer',
              description: 'Высота для изменения размера'
            },
            quality: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              description: 'Качество сжатия (1-100)'
            }
          }
        },
        MediaMultipleUploadRequest: {
          type: 'object',
          required: ['files'],
          properties: {
            files: {
              type: 'array',
              items: {
                type: 'string',
                format: 'binary'
              },
              description: 'Массив медиа файлов для загрузки'
            },
            category: {
              type: 'string',
              enum: ['design', 'portfolio', 'avatar', 'gallery', 'other'],
              description: 'Категория для всех файлов'
            },
            isPublic: {
              type: 'boolean',
              description: 'Публичность для всех файлов'
            }
          }
        },
        MediaUpdateRequest: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description: 'Новое описание'
            },
            alt: {
              type: 'string',
              description: 'Новый альтернативный текст'
            },
            isPublic: {
              type: 'boolean',
              description: 'Новая настройка публичности'
            },
            category: {
              type: 'string',
              enum: ['design', 'portfolio', 'avatar', 'gallery', 'other'],
              description: 'Новая категория'
            }
          }
        },
        MediaListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Статус успешности операции'
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Media'
              },
              description: 'Список медиа файлов'
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  description: 'Текущая страница'
                },
                limit: {
                  type: 'integer',
                  description: 'Количество элементов на странице'
                },
                total: {
                  type: 'integer',
                  description: 'Общее количество элементов'
                },
                pages: {
                  type: 'integer',
                  description: 'Общее количество страниц'
                }
              }
            }
          }
        },
        MediaStatsResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Статус успешности операции'
            },
            data: {
              type: 'object',
              properties: {
                total: {
                  type: 'integer',
                  description: 'Общее количество файлов'
                },
                byType: {
                  type: 'object',
                  properties: {
                    images: {
                      type: 'integer',
                      description: 'Количество изображений'
                    },
                    videos: {
                      type: 'integer',
                      description: 'Количество видео'
                    }
                  }
                },
                byCategory: {
                  type: 'object',
                  properties: {
                    design: {
                      type: 'integer',
                      description: 'Количество файлов в категории "дизайн"'
                    },
                    portfolio: {
                      type: 'integer',
                      description: 'Количество файлов в категории "портфолио"'
                    },
                    avatar: {
                      type: 'integer',
                      description: 'Количество файлов в категории "аватар"'
                    },
                    gallery: {
                      type: 'integer',
                      description: 'Количество файлов в категории "галерея"'
                    },
                    other: {
                      type: 'integer',
                      description: 'Количество файлов в категории "прочее"'
                    }
                  }
                }
              }
            }
          }
        },
        MediaResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Статус успешности операции'
            },
            message: {
              type: 'string',
              description: 'Сообщение о результате операции'
            },
            data: {
              $ref: '#/components/schemas/Media'
            }
          }
        },
        MediaUploadResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Статус успешности операции'
            },
            message: {
              type: 'string',
              description: 'Сообщение о результате операции'
            },
            data: {
              oneOf: [
                { $ref: '#/components/schemas/Media' },
                {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Media' }
                }
              ]
            }
          }
        },
        MediaUrlUpdateResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Статус успешности операции',
              example: true
            },
            message: {
              type: 'string',
              description: 'Сообщение о результате операции',
              example: 'Обновлено 15 медиа файлов'
            },
            data: {
              type: 'object',
              properties: {
                updatedCount: {
                  type: 'integer',
                  description: 'Количество обновленных файлов',
                  example: 15
                }
              }
            }
          }
        },
        Design: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Уникальный идентификатор дизайна'
            },
            title: {
              type: 'string',
              description: 'Название дизайна'
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Описание дизайна'
            },
            category: {
              type: 'string',
              enum: ['classic', 'french', 'gel', 'art', 'seasonal', 'manicure', 'pedicure', 'nail_art', 'extension', 'repair'],
              description: 'Категория дизайна'
            },
            imageUrls: {
              type: 'array',
              items: {
                type: 'string'
              },
              nullable: true,
              description: 'Массив URL изображений дизайна'
            },
            videoUrls: {
              type: 'array',
              items: {
                type: 'string'
              },
              nullable: true,
              description: 'Массив URL видео дизайна'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              nullable: true,
              description: 'Теги дизайна'
            },
            difficulty: {
              type: 'string',
              enum: ['easy', 'medium', 'hard', 'expert'],
              description: 'Сложность выполнения'
            },
            durationMinutes: {
              type: 'integer',
              nullable: true,
              description: 'Время выполнения в минутах'
            },
            price: {
              type: 'number',
              format: 'decimal',
              nullable: true,
              description: 'Цена за выполнение'
            },
            masterId: {
              type: 'string',
              format: 'uuid',
              description: 'ID мастера'
            },
            master: {
              $ref: '#/components/schemas/Master',
              description: 'Мастер'
            },
            authorId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'ID автора дизайна'
            },
            author: {
              $ref: '#/components/schemas/User',
              description: 'Автор дизайна'
            },
            isBaseCatalog: {
              type: 'boolean',
              description: 'Является ли дизайн из базового каталога'
            },
            isApproved: {
              type: 'boolean',
              description: 'Одобрен ли дизайн'
            },
            isActive: {
              type: 'boolean',
              description: 'Активен ли дизайн'
            },
            viewsCount: {
              type: 'integer',
              description: 'Количество просмотров'
            },
            likesCount: {
              type: 'integer',
              description: 'Количество лайков'
            },
            isLiked: {
              type: 'boolean',
              description: 'Лайкнул ли текущий пользователь'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата обновления'
            }
          }
        },
        DesignCreateRequest: {
          type: 'object',
          required: ['title', 'category'],
          properties: {
            title: {
              type: 'string',
              description: 'Название дизайна'
            },
            description: {
              type: 'string',
              description: 'Описание дизайна'
            },
            category: {
              type: 'string',
              enum: ['classic', 'french', 'gel', 'art', 'seasonal', 'manicure', 'pedicure', 'nail_art', 'extension', 'repair'],
              description: 'Категория дизайна'
            },
            imageUrls: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Массив URL изображений'
            },
            videoUrls: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Массив URL видео'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Теги дизайна'
            },
            difficulty: {
              type: 'string',
              enum: ['easy', 'medium', 'hard', 'expert'],
              description: 'Сложность выполнения'
            },
            durationMinutes: {
              type: 'integer',
              description: 'Время выполнения в минутах'
            },
            price: {
              type: 'number',
              format: 'decimal',
              description: 'Цена за выполнение'
            },
            isBaseCatalog: {
              type: 'boolean',
              description: 'Является ли дизайн из базового каталога'
            }
          }
        },
        DesignUpdateRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Название дизайна'
            },
            description: {
              type: 'string',
              description: 'Описание дизайна'
            },
            category: {
              type: 'string',
              enum: ['classic', 'french', 'gel', 'art', 'seasonal', 'manicure', 'pedicure', 'nail_art', 'extension', 'repair'],
              description: 'Категория дизайна'
            },
            imageUrls: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Массив URL изображений'
            },
            videoUrls: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Массив URL видео'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Теги дизайна'
            },
            difficulty: {
              type: 'string',
              enum: ['easy', 'medium', 'hard', 'expert'],
              description: 'Сложность выполнения'
            },
            durationMinutes: {
              type: 'integer',
              description: 'Время выполнения в минутах'
            },
            price: {
              type: 'number',
              format: 'decimal',
              description: 'Цена за выполнение'
            }
          }
        },
        DesignListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Статус успешности операции'
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Design'
              },
              description: 'Список дизайнов'
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  description: 'Текущая страница'
                },
                limit: {
                  type: 'integer',
                  description: 'Количество элементов на странице'
                },
                total: {
                  type: 'integer',
                  description: 'Общее количество элементов'
                },
                pages: {
                  type: 'integer',
                  description: 'Общее количество страниц'
                }
              }
            }
          }
        },
        Comment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Уникальный идентификатор комментария'
            },
            content: {
              type: 'string',
              description: 'Содержание комментария'
            },
            designId: {
              type: 'string',
              format: 'uuid',
              description: 'ID дизайна'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'ID пользователя'
            },
            user: {
              $ref: '#/components/schemas/User',
              description: 'Автор комментария'
            },
            parentId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'ID родительского комментария (для ответов)'
            },
            parent: {
              $ref: '#/components/schemas/Comment',
              nullable: true,
              description: 'Родительский комментарий'
            },
            reply: {
              $ref: '#/components/schemas/Comment',
              nullable: true,
              description: 'Ответ на комментарий'
            },
            isActive: {
              type: 'boolean',
              description: 'Активен ли комментарий'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата обновления'
            }
          }
        },
        CommentCreateRequest: {
          type: 'object',
          required: ['content'],
          properties: {
            content: {
              type: 'string',
              description: 'Содержание комментария'
            },
            parentId: {
              type: 'string',
              format: 'uuid',
              description: 'ID родительского комментария (для ответов)'
            }
          }
        },
        CommentUpdateRequest: {
          type: 'object',
          required: ['content'],
          properties: {
            content: {
              type: 'string',
              description: 'Новое содержание комментария'
            }
          }
        },
        Like: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Уникальный идентификатор лайка'
            },
            designId: {
              type: 'string',
              format: 'uuid',
              description: 'ID дизайна'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'ID пользователя'
            },
            user: {
              $ref: '#/components/schemas/User',
              description: 'Пользователь, поставивший лайк'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания'
            }
          }
        },
        Booking: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Уникальный идентификатор записи'
            },
            clientId: {
              type: 'string',
              format: 'uuid',
              description: 'ID клиента'
            },
            client: {
              $ref: '#/components/schemas/Client',
              description: 'Клиент'
            },
            masterId: {
              type: 'string',
              format: 'uuid',
              description: 'ID мастера'
            },
            master: {
              $ref: '#/components/schemas/Master',
              description: 'Мастер'
            },
            designId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'ID дизайна'
            },
            design: {
              $ref: '#/components/schemas/Design',
              nullable: true,
              description: 'Дизайн'
            },
            scheduledAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата и время записи'
            },
            durationMinutes: {
              type: 'integer',
              description: 'Продолжительность в минутах'
            },
            alternativeTimeProposed: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Альтернативное время, предложенное мастером'
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'],
              description: 'Статус записи'
            },
            notes: {
              type: 'string',
              nullable: true,
              description: 'Заметки к записи'
            },
            price: {
              type: 'number',
              format: 'decimal',
              nullable: true,
              description: 'Цена услуги'
            },
            cancellationReason: {
              type: 'string',
              nullable: true,
              description: 'Причина отмены'
            },
            confirmedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Дата подтверждения'
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Дата завершения'
            },
            isAutoRejected: {
              type: 'boolean',
              description: 'Автоматически отклонена ли запись'
            },
            responseDeadline: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Дедлайн для ответа мастера'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата обновления'
            }
          }
        },
        BookingCreateRequest: {
          type: 'object',
          required: ['masterId', 'scheduledAt'],
          properties: {
            masterId: {
              type: 'string',
              format: 'uuid',
              description: 'ID мастера'
            },
            designId: {
              type: 'string',
              format: 'uuid',
              description: 'ID дизайна'
            },
            scheduledAt: {
              type: 'string',
              format: 'date-time',
              description: 'Желаемая дата и время записи'
            },
            durationMinutes: {
              type: 'integer',
              description: 'Продолжительность в минутах'
            },
            notes: {
              type: 'string',
              description: 'Заметки к записи'
            }
          }
        },
        BookingUpdateRequest: {
          type: 'object',
          properties: {
            scheduledAt: {
              type: 'string',
              format: 'date-time',
              description: 'Новая дата и время записи'
            },
            durationMinutes: {
              type: 'integer',
              description: 'Продолжительность в минутах'
            },
            notes: {
              type: 'string',
              description: 'Заметки к записи'
            },
            price: {
              type: 'number',
              format: 'decimal',
              description: 'Цена услуги'
            }
          }
        },
        BookingResponseRequest: {
          type: 'object',
          required: ['action'],
          properties: {
            action: {
              type: 'string',
              enum: ['confirm', 'reject', 'suggest_alternative'],
              description: 'Действие мастера'
            },
            alternativeDateTime: {
              type: 'string',
              format: 'date-time',
              description: 'Альтернативное время (для suggest_alternative)'
            },
            notes: {
              type: 'string',
              description: 'Комментарий мастера'
            },
            price: {
              type: 'number',
              format: 'decimal',
              description: 'Цена услуги'
            }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Уникальный идентификатор уведомления'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'ID получателя'
            },
            user: {
              $ref: '#/components/schemas/User',
              description: 'Получатель уведомления'
            },
            type: {
              type: 'string',
              enum: ['booking_created', 'booking_confirmed', 'booking_rejected', 'booking_reminder', 'new_comment', 'new_like', 'rating_decreased'],
              description: 'Тип уведомления'
            },
            title: {
              type: 'string',
              description: 'Заголовок уведомления'
            },
            message: {
              type: 'string',
              description: 'Текст уведомления'
            },
            data: {
              type: 'object',
              nullable: true,
              description: 'Дополнительные данные уведомления'
            },
            isRead: {
              type: 'boolean',
              description: 'Прочитано ли уведомление'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания'
            }
          }
        },
        MasterDesign: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Уникальный идентификатор связи'
            },
            masterId: {
              type: 'string',
              format: 'uuid',
              description: 'ID мастера'
            },
            master: {
              $ref: '#/components/schemas/Master',
              description: 'Мастер'
            },
            designId: {
              type: 'string',
              format: 'uuid',
              description: 'ID дизайна'
            },
            design: {
              $ref: '#/components/schemas/Design',
              description: 'Дизайн'
            },
            canDo: {
              type: 'boolean',
              description: 'Может ли мастер выполнить этот дизайн'
            },
            price: {
              type: 'number',
              format: 'decimal',
              nullable: true,
              description: 'Цена мастера за этот дизайн'
            },
            notes: {
              type: 'string',
              nullable: true,
              description: 'Заметки мастера о дизайне'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Статус успешности операции'
            },
            message: {
              type: 'string',
              description: 'Сообщение о результате операции'
            },
            data: {
              type: 'object',
              nullable: true,
              description: 'Данные ответа'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};

export const swaggerSpec = swaggerJsdoc(options); 