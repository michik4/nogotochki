import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm';
import { Media, MediaType, MediaCategory } from '../entities/Media.entity';
import { User } from '../entities/User';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
}

export interface MediaUploadOptions {
  category?: MediaCategory;
  description?: string;
  alt?: string;
  isPublic?: boolean;
  generateThumbnail?: boolean;
  resizeOptions?: {
    width?: number;
    height?: number;
    quality?: number;
  };
}

export class MediaService {
  private mediaRepository: Repository<Media>;
  private userRepository: Repository<User>;
  private uploadsDir: string;
  private thumbnailsDir: string;

  constructor() {
    this.mediaRepository = AppDataSource.getRepository(Media);
    this.userRepository = AppDataSource.getRepository(User);
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.thumbnailsDir = path.join(this.uploadsDir, 'thumbnails');
    this.ensureDirectories();
  }

  private async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
      await fs.mkdir(this.thumbnailsDir, { recursive: true });
      await fs.mkdir(path.join(this.uploadsDir, 'images'), { recursive: true });
      await fs.mkdir(path.join(this.uploadsDir, 'videos'), { recursive: true });
    } catch (error) {
      console.error('Ошибка создания директорий:', error);
    }
  }

  async uploadFile(
    file: UploadedFile,
    userId?: string,
    options: MediaUploadOptions = {}
  ): Promise<Media> {
    const {
      category = MediaCategory.OTHER,
      description,
      alt,
      isPublic = false,
      generateThumbnail = true,
      resizeOptions
    } = options;

    // Определяем тип медиа
    const mediaType = this.getMediaType(file.mimetype);
    
    // Генерируем уникальное имя файла
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    
    // Определяем путь для сохранения
    const subDir = mediaType === MediaType.IMAGE ? 'images' : 'videos';
    const filePath = path.join(this.uploadsDir, subDir, uniqueFilename);
    
    // Сохраняем файл
    if (file.buffer) {
      await fs.writeFile(filePath, file.buffer);
    } else if (file.path) {
      await fs.copyFile(file.path, filePath);
      await fs.unlink(file.path); // Удаляем временный файл
    }

    // Получаем метаданные файла
    const metadata = await this.getFileMetadata(filePath, mediaType);
    
    // Создаем миниатюру для изображений
    let thumbnailPath: string | undefined;
    if (generateThumbnail && mediaType === MediaType.IMAGE) {
      thumbnailPath = await this.generateThumbnail(filePath, uniqueFilename);
    }

    // Применяем изменение размера если указано
    if (resizeOptions && mediaType === MediaType.IMAGE) {
      await this.resizeImage(filePath, resizeOptions);
    }

    // Создаем запись в базе данных
    const media = new Media();
    media.filename = uniqueFilename;
    media.originalName = file.originalname;
    media.mimeType = file.mimetype;
    media.size = file.size;
    media.path = filePath;
    media.url = this.generateUrl(subDir, uniqueFilename);
    media.type = mediaType;
    media.category = category;
    if (metadata.width) media.width = metadata.width;
    if (metadata.height) media.height = metadata.height;
    if (metadata.duration) media.duration = metadata.duration;
    if (thumbnailPath) media.thumbnailPath = thumbnailPath;
    if (thumbnailPath) media.thumbnailUrl = this.generateThumbnailUrl(uniqueFilename);
    if (description) media.description = description;
    if (alt) media.alt = alt;
    media.isPublic = isPublic;
    if (userId) media.uploadedById = userId;

    return await this.mediaRepository.save(media);
  }

  async getMedia(id: string, userId?: string): Promise<Media | null> {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['uploadedBy']
    });

    if (!media) {
      return null;
    }

    // Проверяем права доступа
    if (!media.isPublic && media.uploadedById !== userId) {
      return null;
    }

    return media;
  }

  async getMediaList(
    userId?: string,
    options: {
      category?: MediaCategory;
      type?: MediaType;
      isPublic?: boolean;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ media: Media[]; total: number }> {
    const {
      category,
      type,
      isPublic,
      page = 1,
      limit = 20
    } = options;

    const queryBuilder = this.mediaRepository
      .createQueryBuilder('media')
      .leftJoinAndSelect('media.uploadedBy', 'user')
      .where('media.isActive = :isActive', { isActive: true });

    if (category) {
      queryBuilder.andWhere('media.category = :category', { category });
    }

    if (type) {
      queryBuilder.andWhere('media.type = :type', { type });
    }

    if (isPublic !== undefined) {
      queryBuilder.andWhere('media.isPublic = :isPublic', { isPublic });
    }

    if (userId && isPublic !== true) {
      queryBuilder.andWhere(
        '(media.isPublic = true OR media.uploadedById = :userId)',
        { userId }
      );
    }

    queryBuilder
      .orderBy('media.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [media, total] = await queryBuilder.getManyAndCount();

    return { media, total };
  }

  async deleteMedia(id: string, userId?: string): Promise<boolean> {
    const media = await this.mediaRepository.findOne({
      where: { id }
    });

    if (!media) {
      return false;
    }

    // Проверяем права доступа
    if (media.uploadedById !== userId) {
      return false;
    }

    try {
      // Удаляем файлы
      await fs.unlink(media.path);
      if (media.thumbnailPath) {
        await fs.unlink(media.thumbnailPath);
      }

      // Удаляем запись из базы данных
      await this.mediaRepository.remove(media);
      return true;
    } catch (error) {
      console.error('Ошибка удаления медиа файла:', error);
      return false;
    }
  }

  async updateMedia(
    id: string,
    updates: Partial<Pick<Media, 'description' | 'alt' | 'isPublic' | 'category'>>,
    userId?: string
  ): Promise<Media | null> {
    const media = await this.mediaRepository.findOne({
      where: { id }
    });

    if (!media || media.uploadedById !== userId) {
      return null;
    }

    Object.assign(media, updates);
    return await this.mediaRepository.save(media);
  }

  private getMediaType(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) {
      return MediaType.IMAGE;
    } else if (mimeType.startsWith('video/')) {
      return MediaType.VIDEO;
    }
    throw new Error(`Неподдерживаемый тип файла: ${mimeType}`);
  }

  private async getFileMetadata(filePath: string, type: MediaType): Promise<{
    width?: number;
    height?: number;
    duration?: number;
  }> {
    if (type === MediaType.IMAGE) {
      try {
        const metadata = await sharp(filePath).metadata();
        return {
          width: metadata.width,
          height: metadata.height
        };
      } catch (error) {
        console.error('Ошибка получения метаданных изображения:', error);
        return {};
      }
    }

    // Для видео можно добавить обработку с помощью ffprobe
    return {};
  }

  private async generateThumbnail(filePath: string, filename: string): Promise<string> {
    const thumbnailFilename = `thumb_${filename.replace(path.extname(filename), '.jpg')}`;
    const thumbnailPath = path.join(this.thumbnailsDir, thumbnailFilename);

    try {
      await sharp(filePath)
        .resize(300, 300, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      return thumbnailPath;
    } catch (error) {
      console.error('Ошибка создания миниатюры:', error);
      throw error;
    }
  }

  private async resizeImage(filePath: string, options: {
    width?: number;
    height?: number;
    quality?: number;
  }): Promise<void> {
    const { width, height, quality = 90 } = options;

    try {
      const image = sharp(filePath);
      
      if (width || height) {
        image.resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      await image.jpeg({ quality }).toFile(filePath + '.tmp');
      await fs.rename(filePath + '.tmp', filePath);
    } catch (error) {
      console.error('Ошибка изменения размера изображения:', error);
      throw error;
    }
  }

  private generateUrl(subDir: string, filename: string): string {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/uploads/${subDir}/${filename}`;
  }

  private generateThumbnailUrl(filename: string): string {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const thumbnailFilename = `thumb_${filename.replace(path.extname(filename), '.jpg')}`;
    return `${baseUrl}/uploads/thumbnails/${thumbnailFilename}`;
  }

  async getFileStream(filePath: string): Promise<NodeJS.ReadableStream> {
    const fs = require('fs');
    return fs.createReadStream(filePath);
  }

  async getFileStats(filePath: string): Promise<any> {
    const stats = await fs.stat(filePath);
    return stats;
  }

  /**
   * Обновляет URL для всех существующих медиа файлов
   * Используется для миграции со старых URL на новые
   */
  async updateAllMediaUrls(): Promise<number> {
    try {
      const allMedia = await this.mediaRepository.find();
      let updatedCount = 0;

      for (const media of allMedia) {
        const oldUrl = media.url;
        const oldThumbnailUrl = media.thumbnailUrl;

        // Определяем тип директории по типу медиа
        const subDir = media.type === MediaType.IMAGE ? 'images' : 'videos';
        
        // Генерируем новые URL
        const newUrl = this.generateUrl(subDir, media.filename);
        const newThumbnailUrl = media.thumbnailUrl ? this.generateThumbnailUrl(media.filename) : null;

        // Обновляем только если URL изменился
        if (oldUrl !== newUrl || oldThumbnailUrl !== newThumbnailUrl) {
          media.url = newUrl;
          if (newThumbnailUrl) {
            media.thumbnailUrl = newThumbnailUrl;
          }
          
          await this.mediaRepository.save(media);
          updatedCount++;
          
          console.log(`📝 Обновлен URL для файла ${media.filename}: ${oldUrl} -> ${newUrl}`);
        }
      }

      console.log(`✅ Обновлено ${updatedCount} медиа файлов`);
      return updatedCount;
    } catch (error) {
      console.error('❌ Ошибка обновления URL медиа файлов:', error);
      return 0;
    }
  }
} 