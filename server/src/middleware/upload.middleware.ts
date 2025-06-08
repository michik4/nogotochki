import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Конфигурация для хранения файлов в памяти
const memoryStorage = multer.memoryStorage();

// Конфигурация для хранения файлов на диске
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Временная папка для загрузки
    cb(null, path.join(process.cwd(), 'uploads', 'temp'));
  },
  filename: (req, file, cb) => {
    // Генерируем уникальное имя файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `temp-${uniqueSuffix}${ext}`);
  }
});

// Фильтр для проверки типов файлов
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Разрешенные MIME типы
  const allowedMimeTypes = [
    // Изображения
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Видео
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo', // .avi
    'video/x-ms-wmv'   // .wmv
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Неподдерживаемый тип файла: ${file.mimetype}. Разрешены: ${allowedMimeTypes.join(', ')}`));
  }
};

// Основная конфигурация multer
const uploadConfig = {
  storage: memoryStorage, // Используем память для большей гибкости
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB максимальный размер файла
    files: 10 // Максимум 10 файлов за раз
  }
};

// Middleware для загрузки одного файла
export const uploadSingle = multer(uploadConfig).single('file');

// Middleware для загрузки нескольких файлов
export const uploadMultiple = multer(uploadConfig).array('files', 10);

// Middleware для загрузки файлов с разными полями
export const uploadFields = multer(uploadConfig).fields([
  { name: 'image', maxCount: 5 },
  { name: 'video', maxCount: 3 },
  { name: 'thumbnail', maxCount: 1 }
]);

// Middleware для обработки ошибок загрузки
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'Файл слишком большой. Максимальный размер: 100MB',
          code: 'FILE_TOO_LARGE'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Слишком много файлов. Максимум: 10 файлов',
          code: 'TOO_MANY_FILES'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Неожиданное поле файла',
          code: 'UNEXPECTED_FIELD'
        });
      default:
        return res.status(400).json({
          success: false,
          message: `Ошибка загрузки: ${error.message}`,
          code: 'UPLOAD_ERROR'
        });
    }
  }

  if (error.message.includes('Неподдерживаемый тип файла')) {
    return res.status(400).json({
      success: false,
      message: error.message,
      code: 'INVALID_FILE_TYPE'
    });
  }

  next(error);
};

// Утилита для проверки размера изображения
export const validateImageDimensions = (
  minWidth?: number,
  minHeight?: number,
  maxWidth?: number,
  maxHeight?: number
) => {
  return async (req: Request, res: any, next: any) => {
    if (!req.file || !req.file.mimetype.startsWith('image/')) {
      return next();
    }

    try {
      const sharp = require('sharp');
      const metadata = await sharp(req.file.buffer).metadata();

      if (minWidth && metadata.width && metadata.width < minWidth) {
        return res.status(400).json({
          success: false,
          message: `Минимальная ширина изображения: ${minWidth}px`,
          code: 'IMAGE_TOO_SMALL'
        });
      }

      if (minHeight && metadata.height && metadata.height < minHeight) {
        return res.status(400).json({
          success: false,
          message: `Минимальная высота изображения: ${minHeight}px`,
          code: 'IMAGE_TOO_SMALL'
        });
      }

      if (maxWidth && metadata.width && metadata.width > maxWidth) {
        return res.status(400).json({
          success: false,
          message: `Максимальная ширина изображения: ${maxWidth}px`,
          code: 'IMAGE_TOO_LARGE'
        });
      }

      if (maxHeight && metadata.height && metadata.height > maxHeight) {
        return res.status(400).json({
          success: false,
          message: `Максимальная высота изображения: ${maxHeight}px`,
          code: 'IMAGE_TOO_LARGE'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware для проверки квоты пользователя
export const checkUserQuota = (maxFiles: number = 100, maxSize: number = 1024 * 1024 * 1024) => {
  return async (req: Request, res: any, next: any) => {
    const userId = req.user?.userId;
    
    if (!userId) {
      return next();
    }

    try {
      // Здесь можно добавить проверку квоты пользователя
      // Пока что пропускаем
      next();
    } catch (error) {
      next(error);
    }
  };
}; 