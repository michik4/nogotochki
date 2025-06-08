import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Утилиты для работы с файловой системой
 */
export class FileSystemUtil {
  /**
   * Создает необходимые директории для медиа файлов
   */
  static async ensureMediaDirectories(): Promise<void> {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const directories = [
      uploadsDir,
      path.join(uploadsDir, 'images'),
      path.join(uploadsDir, 'videos'),
      path.join(uploadsDir, 'thumbnails'),
      path.join(uploadsDir, 'temp')
    ];

    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
        console.log(`📁 Директория создана: ${dir}`);
      } catch (error) {
        console.error(`❌ Ошибка создания директории ${dir}:`, error);
      }
    }
  }

  /**
   * Проверяет существование файла
   */
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Получает размер файла
   */
  static async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  /**
   * Удаляет файл если он существует
   */
  static async deleteFileIfExists(filePath: string): Promise<boolean> {
    try {
      if (await this.fileExists(filePath)) {
        await fs.unlink(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`❌ Ошибка удаления файла ${filePath}:`, error);
      return false;
    }
  }

  /**
   * Создает символическую ссылку для быстрого доступа
   */
  static async createSymlink(target: string, linkPath: string): Promise<boolean> {
    try {
      if (await this.fileExists(linkPath)) {
        await fs.unlink(linkPath);
      }
      await fs.symlink(target, linkPath);
      return true;
    } catch (error) {
      console.error(`❌ Ошибка создания символической ссылки:`, error);
      return false;
    }
  }

  /**
   * Получает информацию о директории
   */
  static async getDirectoryInfo(dirPath: string): Promise<{
    exists: boolean;
    fileCount: number;
    totalSize: number;
  }> {
    try {
      if (!(await this.fileExists(dirPath))) {
        return { exists: false, fileCount: 0, totalSize: 0 };
      }

      const files = await fs.readdir(dirPath);
      let totalSize = 0;
      let fileCount = 0;

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          totalSize += stats.size;
          fileCount++;
        }
      }

      return { exists: true, fileCount, totalSize };
    } catch (error) {
      console.error(`❌ Ошибка получения информации о директории:`, error);
      return { exists: false, fileCount: 0, totalSize: 0 };
    }
  }

  /**
   * Очищает временные файлы старше указанного времени
   */
  static async cleanupTempFiles(maxAgeHours: number = 24): Promise<number> {
    const tempDir = path.join(process.cwd(), 'uploads', 'temp');
    let deletedCount = 0;

    try {
      if (!(await this.fileExists(tempDir))) {
        return 0;
      }

      const files = await fs.readdir(tempDir);
      const maxAge = Date.now() - (maxAgeHours * 60 * 60 * 1000);

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile() && stats.mtime.getTime() < maxAge) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }

      console.log(`🧹 Очищено ${deletedCount} временных файлов`);
      return deletedCount;
    } catch (error) {
      console.error(`❌ Ошибка очистки временных файлов:`, error);
      return 0;
    }
  }
} 