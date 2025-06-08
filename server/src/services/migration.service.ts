import { AppDataSource } from '../config/typeorm';

export class MigrationService {
  /**
   * Запуск всех ожидающих миграций
   */
  static async runMigrations(): Promise<void> {
    try {
      console.log('🔄 Запуск миграций...');
      
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      const migrations = await AppDataSource.runMigrations();
      
      if (migrations.length === 0) {
        console.log('✅ Все миграции уже выполнены');
      } else {
        console.log(`✅ Выполнено миграций: ${migrations.length}`);
        migrations.forEach(migration => {
          console.log(`   - ${migration.name}`);
        });
      }
    } catch (error) {
      console.error('❌ Ошибка при выполнении миграций:', error);
      throw error;
    }
  }

  /**
   * Откат последней миграции
   */
  static async revertLastMigration(): Promise<void> {
    try {
      console.log('🔄 Откат последней миграции...');
      
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      await AppDataSource.undoLastMigration();
      console.log('✅ Последняя миграция отменена');
    } catch (error) {
      console.error('❌ Ошибка при откате миграции:', error);
      throw error;
    }
  }

  /**
   * Показать статус миграций
   */
  static async showMigrations(): Promise<void> {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      const executedMigrations = await AppDataSource.query(
        `SELECT * FROM migrations_history ORDER BY timestamp DESC`
      );

      const pendingMigrations = await AppDataSource.showMigrations();

      console.log('\n📊 Статус миграций:');
      console.log('==================');
      
      if (executedMigrations.length > 0) {
        console.log('\n✅ Выполненные миграции:');
        executedMigrations.forEach((migration: any) => {
          console.log(`   - ${migration.name} (${new Date(migration.timestamp).toLocaleString()})`);
        });
      }

      if (pendingMigrations) {
        console.log('\n⏳ Ожидающие миграции найдены');
      } else {
        console.log('\n✅ Все миграции выполнены');
      }
    } catch (error) {
      console.error('❌ Ошибка при получении статуса миграций:', error);
      throw error;
    }
  }

  /**
   * Синхронизация схемы (только для разработки!)
   */
  static async syncSchema(): Promise<void> {
    try {
      console.log('⚠️  Синхронизация схемы базы данных...');
      console.log('⚠️  ВНИМАНИЕ: Это может привести к потере данных!');
      
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      await AppDataSource.synchronize();
      console.log('✅ Схема синхронизирована');
    } catch (error) {
      console.error('❌ Ошибка при синхронизации схемы:', error);
      throw error;
    }
  }

  /**
   * Очистка базы данных (только для разработки!)
   */
  static async dropSchema(): Promise<void> {
    try {
      console.log('⚠️  Удаление всех таблиц...');
      console.log('⚠️  ВНИМАНИЕ: Все данные будут потеряны!');
      
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      await AppDataSource.dropDatabase();
      console.log('✅ База данных очищена');
    } catch (error) {
      console.error('❌ Ошибка при очистке базы данных:', error);
      throw error;
    }
  }

  /**
   * Проверка подключения к базе данных
   */
  static async checkConnection(): Promise<boolean> {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.query('SELECT 1');
      await queryRunner.release();
      
      console.log('✅ Подключение к базе данных работает');
      return true;
    } catch (error) {
      console.error('❌ Ошибка подключения к базе данных:', error);
      return false;
    }
  }
} 