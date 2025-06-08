#!/usr/bin/env node

import 'reflect-metadata';
import { MigrationService } from '../services/migration.service';
import { closeDatabase } from '../config/typeorm';

const command = process.argv[2];
const args = process.argv.slice(3);

async function runCommand() {
  try {
    switch (command) {
      case 'run':
        await MigrationService.runMigrations();
        break;
        
      case 'revert':
        await MigrationService.revertLastMigration();
        break;
        
      case 'show':
      case 'status':
        await MigrationService.showMigrations();
        break;
        
      case 'sync':
        if (process.env.NODE_ENV === 'production') {
          console.error('❌ Синхронизация схемы запрещена в продакшене!');
          process.exit(1);
        }
        await MigrationService.syncSchema();
        break;
        
      case 'drop':
        if (process.env.NODE_ENV === 'production') {
          console.error('❌ Очистка базы данных запрещена в продакшене!');
          process.exit(1);
        }
        await MigrationService.dropSchema();
        break;
        
      case 'check':
        const isConnected = await MigrationService.checkConnection();
        process.exit(isConnected ? 0 : 1);
        
      default:
        console.log(`
🗄️  NailMasters Database Migration CLI

Использование: npm run db <command>

Команды:
  run      - Запустить все ожидающие миграции
  revert   - Откатить последнюю миграцию
  show     - Показать статус миграций
  status   - Показать статус миграций (алиас для show)
  sync     - Синхронизировать схему (только для разработки)
  drop     - Очистить базу данных (только для разработки)
  check    - Проверить подключение к базе данных

Примеры:
  npm run db run      # Запустить миграции
  npm run db show     # Показать статус
  npm run db check    # Проверить подключение

Для создания новой миграции используйте:
  npm run migration:generate src/migrations/MigrationName
  npm run migration:create src/migrations/MigrationName
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Ошибка выполнения команды:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
    process.exit(0);
  }
}

runCommand(); 