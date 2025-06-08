import { Router, Request, Response } from 'express';
import { MediaController } from '../controllers/media.controller';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware';
import { 
  uploadSingle, 
  uploadMultiple, 
  handleUploadError,
  validateImageDimensions,
  checkUserQuota 
} from '../middleware/upload.middleware';

const router = Router();
const mediaController = new MediaController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Media:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Уникальный идентификатор медиа файла
 *         filename:
 *           type: string
 *           description: Имя файла в системе
 *         originalName:
 *           type: string
 *           description: Оригинальное имя файла
 *         mimeType:
 *           type: string
 *           description: MIME тип файла
 *         size:
 *           type: integer
 *           description: Размер файла в байтах
 *         url:
 *           type: string
 *           description: URL для доступа к файлу
 *         type:
 *           type: string
 *           enum: [image, video]
 *           description: Тип медиа файла
 *         category:
 *           type: string
 *           enum: [design, portfolio, avatar, gallery, other]
 *           description: Категория медиа файла
 *         width:
 *           type: integer
 *           description: Ширина изображения/видео
 *         height:
 *           type: integer
 *           description: Высота изображения/видео
 *         duration:
 *           type: integer
 *           description: Длительность видео в секундах
 *         thumbnailUrl:
 *           type: string
 *           description: URL миниатюры
 *         description:
 *           type: string
 *           description: Описание медиа файла
 *         alt:
 *           type: string
 *           description: Альтернативный текст для изображений
 *         isPublic:
 *           type: boolean
 *           description: Публичный ли файл
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Дата создания
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Дата обновления
 */

/**
 * @swagger
 * /media/upload:
 *   post:
 *     summary: Загрузка медиа файла
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Медиа файл для загрузки
 *               category:
 *                 type: string
 *                 enum: [design, portfolio, avatar, gallery, other]
 *                 description: Категория файла
 *               description:
 *                 type: string
 *                 description: Описание файла
 *               alt:
 *                 type: string
 *                 description: Альтернативный текст
 *               isPublic:
 *                 type: boolean
 *                 description: Публичный ли файл
 *               generateThumbnail:
 *                 type: boolean
 *                 description: Создавать ли миниатюру
 *               width:
 *                 type: integer
 *                 description: Ширина для изменения размера
 *               height:
 *                 type: integer
 *                 description: Высота для изменения размера
 *               quality:
 *                 type: integer
 *                 description: Качество сжатия (1-100)
 *     responses:
 *       201:
 *         description: Файл успешно загружен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MediaUploadResponse'
 *       400:
 *         description: Ошибка валидации или неподдерживаемый тип файла
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Не авторизован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       413:
 *         description: Файл слишком большой
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/upload', 
  authenticateToken,
  checkUserQuota(),
  uploadSingle,
  handleUploadError,
  mediaController.uploadMedia
);

/**
 * @swagger
 * /media/upload-multiple:
 *   post:
 *     summary: Загрузка нескольких медиа файлов
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Медиа файлы для загрузки
 *               category:
 *                 type: string
 *                 enum: [design, portfolio, avatar, gallery, other]
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Файлы успешно загружены
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MediaUploadResponse'
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/upload-multiple',
  authenticateToken,
  checkUserQuota(),
  uploadMultiple,
  handleUploadError,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Файлы не предоставлены'
        });
        return;
      }

      const userId = req.user?.userId;
      const { category, isPublic } = req.body;
      
      const uploadPromises = req.files.map(file => 
        mediaController['mediaService'].uploadFile(file, userId, {
          category,
          isPublic: isPublic === 'true'
        })
      );

      const results = await Promise.all(uploadPromises);

      res.status(201).json({
        success: true,
        message: `Успешно загружено ${results.length} файлов`,
        data: results
      });
    } catch (error: any) {
      console.error('Ошибка множественной загрузки:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Ошибка загрузки файлов'
      });
    }
  }
);

/**
 * @swagger
 * /media:
 *   get:
 *     summary: Получение списка медиа файлов
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [design, portfolio, avatar, gallery, other]
 *         description: Фильтр по категории
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [image, video]
 *         description: Фильтр по типу
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *         description: Фильтр по публичности
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Количество элементов на странице
 *     responses:
 *       200:
 *         description: Список медиа файлов
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MediaListResponse'
 */
router.get('/', optionalAuth, mediaController.getMediaList);

/**
 * @swagger
 * /media/stats:
 *   get:
 *     summary: Получение статистики по медиа файлам
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Статистика медиа файлов
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MediaStatsResponse'
 */
router.get('/stats', authenticateToken, mediaController.getMediaStats);

/**
 * @swagger
 * /media/update-urls:
 *   post:
 *     summary: Обновление URL всех медиа файлов (миграция)
 *     description: |
 *       Обновляет URL для всех существующих медиа файлов в базе данных.
 *       Используется для миграции со старых URL (/api/media/) на новые (/uploads/).
 *       Этот эндпоинт полезен после изменения структуры URL или при переносе файлов.
 *       
 *       **Примечание:** Требует права администратора или владельца файлов.
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: URL успешно обновлены
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MediaUrlUpdateResponse'
 *       401:
 *         description: Не авторизован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/update-urls', authenticateToken, mediaController.updateAllUrls);

/**
 * @swagger
 * /media/{id}/url:
 *   get:
 *     summary: Получение прямой ссылки на медиа файл
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID медиа файла
 *     responses:
 *       200:
 *         description: Прямая ссылка на файл
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     url:
 *                       type: string
 *                       description: Прямая ссылка на файл
 *                     thumbnailUrl:
 *                       type: string
 *                       description: Прямая ссылка на миниатюру
 *                     type:
 *                       type: string
 *                       enum: [image, video]
 *                     mimeType:
 *                       type: string
 *                     filename:
 *                       type: string
 *                     originalName:
 *                       type: string
 *       404:
 *         description: Медиа файл не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id/url', optionalAuth, mediaController.getFileUrl);

/**
 * @swagger
 * /media/{id}:
 *   get:
 *     summary: Получение информации о медиа файле
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID медиа файла
 *     responses:
 *       200:
 *         description: Информация о медиа файле
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MediaResponse'
 *       404:
 *         description: Медиа файл не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', optionalAuth, mediaController.getMediaInfo);

/**
 * @swagger
 * /media/{id}:
 *   put:
 *     summary: Обновление информации о медиа файле
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MediaUpdateRequest'
 *     responses:
 *       200:
 *         description: Медиа файл обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MediaResponse'
 *       404:
 *         description: Медиа файл не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', authenticateToken, mediaController.updateMedia);

/**
 * @swagger
 * /media/{id}:
 *   delete:
 *     summary: Удаление медиа файла
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Медиа файл удален
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Медиа файл не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authenticateToken, mediaController.deleteMedia);

/**
 * @swagger
 * /media/{type}/{filename}:
 *   get:
 *     summary: Раздача медиа файлов
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [images, videos, thumbnails]
 *         description: Тип медиа файла
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Имя файла
 *     responses:
 *       200:
 *         description: Медиа файл
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *           video/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Файл не найден
 */
router.get('/:type/:filename', mediaController.serveMedia);

export default router;
