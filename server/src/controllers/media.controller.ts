import { Request, Response } from 'express';
import { MediaService, MediaUploadOptions } from '../services/media.service';
import { MediaCategory, MediaType } from '../entities/Media.entity';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const stat = promisify(fs.stat);

export class MediaController {
  private mediaService: MediaService;

  constructor() {
    this.mediaService = new MediaService();
  }

  /**
   * Загрузка медиа файла
   */
  uploadMedia = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Файл не предоставлен'
        });
        return;
      }

      const userId = req.user?.userId;
      const {
        category,
        description,
        alt,
        isPublic,
        generateThumbnail,
        width,
        height,
        quality
      } = req.body;

      const options: MediaUploadOptions = {
        category: category as MediaCategory,
        description,
        alt,
        isPublic: isPublic === 'true',
        generateThumbnail: generateThumbnail !== 'false',
        resizeOptions: (width || height || quality) ? {
          width: width ? parseInt(width) : undefined,
          height: height ? parseInt(height) : undefined,
          quality: quality ? parseInt(quality) : undefined
        } : undefined
      };

      const media = await this.mediaService.uploadFile(req.file, userId, options);

      res.status(201).json({
        success: true,
        message: 'Файл успешно загружен',
        data: media
      });
    } catch (error: any) {
      console.error('Ошибка загрузки файла:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Ошибка загрузки файла'
      });
    }
  };

  /**
   * Получение информации о медиа файле
   */
  getMediaInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const media = await this.mediaService.getMedia(id, userId);

      if (!media) {
        res.status(404).json({
          success: false,
          message: 'Медиа файл не найден'
        });
        return;
      }

      res.json({
        success: true,
        data: media
      });
    } catch (error: any) {
      console.error('Ошибка получения медиа:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка получения медиа файла'
      });
    }
  };

  /**
   * Получение списка медиа файлов
   */
  getMediaList = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const {
        category,
        type,
        isPublic,
        page = '1',
        limit = '20'
      } = req.query;

      const options = {
        category: category as MediaCategory,
        type: type as MediaType,
        isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const result = await this.mediaService.getMediaList(userId, options);

      res.json({
        success: true,
        data: result.media,
        pagination: {
          page: options.page,
          limit: options.limit,
          total: result.total,
          pages: Math.ceil(result.total / options.limit)
        }
      });
    } catch (error: any) {
      console.error('Ошибка получения списка медиа:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка получения списка медиа файлов'
      });
    }
  };

  /**
   * Обновление информации о медиа файле
   */
  updateMedia = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const { description, alt, isPublic, category } = req.body;

      const updates = {
        description,
        alt,
        isPublic,
        category
      };

      const media = await this.mediaService.updateMedia(id, updates, userId);

      if (!media) {
        res.status(404).json({
          success: false,
          message: 'Медиа файл не найден или нет прав доступа'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Медиа файл успешно обновлен',
        data: media
      });
    } catch (error: any) {
      console.error('Ошибка обновления медиа:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка обновления медиа файла'
      });
    }
  };

  /**
   * Удаление медиа файла
   */
  deleteMedia = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const success = await this.mediaService.deleteMedia(id, userId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Медиа файл не найден или нет прав доступа'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Медиа файл успешно удален'
      });
    } catch (error: any) {
      console.error('Ошибка удаления медиа:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка удаления медиа файла'
      });
    }
  };

  /**
   * Раздача медиа файлов
   */
  serveMedia = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type, filename } = req.params;

      // Определяем путь к файлу
      let filePath: string;
      if (type === 'thumbnails') {
        filePath = path.join(process.cwd(), 'uploads', 'thumbnails', filename);
      } else if (type === 'images' || type === 'videos') {
        filePath = path.join(process.cwd(), 'uploads', type, filename);
      } else {
        res.status(400).json({
          success: false,
          message: 'Неверный тип медиа'
        });
        return;
      }

      // Проверяем существование файла
      try {
        await stat(filePath);
      } catch (error) {
        res.status(404).json({
          success: false,
          message: 'Файл не найден'
        });
        return;
      }

      // Определяем MIME тип
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';
      
      switch (ext) {
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        case '.gif':
          contentType = 'image/gif';
          break;
        case '.webp':
          contentType = 'image/webp';
          break;
        case '.mp4':
          contentType = 'video/mp4';
          break;
        case '.webm':
          contentType = 'video/webm';
          break;
        case '.mov':
          contentType = 'video/quicktime';
          break;
      }

      // Устанавливаем заголовки
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Кэш на год

      // Поддержка Range запросов для видео
      const stats = await stat(filePath);
      const range = req.headers.range;

      if (range && contentType.startsWith('video/')) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
        const chunksize = (end - start) + 1;

        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${stats.size}`);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Length', chunksize);

        const stream = fs.createReadStream(filePath, { start, end });
        stream.pipe(res);
      } else {
        res.setHeader('Content-Length', stats.size);
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
      }
    } catch (error: any) {
      console.error('Ошибка раздачи медиа:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка раздачи медиа файла'
      });
    }
  };

  /**
   * Получение прямой ссылки на файл
   */
  getFileUrl = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const media = await this.mediaService.getMedia(id, userId);

      if (!media) {
        res.status(404).json({
          success: false,
          message: 'Медиа файл не найден'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: media.id,
          url: media.url,
          thumbnailUrl: media.thumbnailUrl,
          type: media.type,
          mimeType: media.mimeType,
          filename: media.filename,
          originalName: media.originalName
        }
      });
    } catch (error: any) {
      console.error('Ошибка получения URL файла:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка получения URL файла'
      });
    }
  };

  /**
   * Обновление URL всех медиа файлов (миграция)
   */
  updateAllUrls = async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedCount = await this.mediaService.updateAllMediaUrls();

      res.json({
        success: true,
        message: `Обновлено ${updatedCount} медиа файлов`,
        data: {
          updatedCount
        }
      });
    } catch (error: any) {
      console.error('Ошибка обновления URL:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка обновления URL медиа файлов'
      });
    }
  };

  /**
   * Получение статистики по медиа файлам
   */
  getMediaStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      // Получаем статистику по типам
      const imageStats = await this.mediaService.getMediaList(userId, {
        type: MediaType.IMAGE,
        limit: 1
      });

      const videoStats = await this.mediaService.getMediaList(userId, {
        type: MediaType.VIDEO,
        limit: 1
      });

      // Получаем статистику по категориям
      const categoryStats = await Promise.all([
        this.mediaService.getMediaList(userId, { category: MediaCategory.DESIGN, limit: 1 }),
        this.mediaService.getMediaList(userId, { category: MediaCategory.PORTFOLIO, limit: 1 }),
        this.mediaService.getMediaList(userId, { category: MediaCategory.AVATAR, limit: 1 }),
        this.mediaService.getMediaList(userId, { category: MediaCategory.GALLERY, limit: 1 }),
        this.mediaService.getMediaList(userId, { category: MediaCategory.OTHER, limit: 1 })
      ]);

      res.json({
        success: true,
        data: {
          total: imageStats.total + videoStats.total,
          byType: {
            images: imageStats.total,
            videos: videoStats.total
          },
          byCategory: {
            design: categoryStats[0].total,
            portfolio: categoryStats[1].total,
            avatar: categoryStats[2].total,
            gallery: categoryStats[3].total,
            other: categoryStats[4].total
          }
        }
      });
    } catch (error: any) {
      console.error('Ошибка получения статистики:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка получения статистики'
      });
    }
  };
} 