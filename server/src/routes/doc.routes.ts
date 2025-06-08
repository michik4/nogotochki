import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger';

const docRouter = Router();

// Swagger UI документация
docRouter.use('/swagger', swaggerUi.serve);
docRouter.get('/swagger', swaggerUi.setup(swaggerSpec, {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 50px 0 }
    .swagger-ui .info .title { color: #3b4151; font-size: 36px }
  `,
  customSiteTitle: 'NailMasters API Documentation',
  customfavIcon: '/favicon.ico'
}));

// JSON спецификация OpenAPI
docRouter.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Главная страница документации
docRouter.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NailMasters API Documentation</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: #f8f9fa;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 {
                color: #2c3e50;
                border-bottom: 3px solid #3498db;
                padding-bottom: 10px;
            }
            .btn {
                display: inline-block;
                padding: 12px 24px;
                margin: 10px 10px 10px 0;
                background: #3498db;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                transition: background 0.3s;
            }
            .btn:hover {
                background: #2980b9;
            }
            .btn.secondary {
                background: #95a5a6;
            }
            .btn.secondary:hover {
                background: #7f8c8d;
            }
            .info-box {
                background: #e8f4fd;
                border-left: 4px solid #3498db;
                padding: 15px;
                margin: 20px 0;
            }
            .endpoint {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                padding: 10px;
                margin: 10px 0;
                font-family: 'Courier New', monospace;
            }
            .method {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 3px;
                font-size: 12px;
                font-weight: bold;
                margin-right: 10px;
            }
            .get { background: #61affe; color: white; }
            .post { background: #49cc90; color: white; }
            .put { background: #fca130; color: white; }
            .delete { background: #f93e3e; color: white; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎨 NailMasters API Documentation</h1>
            
            <div class="info-box">
                <strong>Добро пожаловать в документацию API NailMasters!</strong><br>
                Это RESTful API для платформы, соединяющей мастеров маникюра с клиентами.
            </div>

            <h2>📚 Документация</h2>
            <a href="/api/docs/swagger" class="btn">Интерактивная документация (Swagger UI)</a>
            <a href="/api/docs/swagger.json" class="btn secondary">OpenAPI JSON спецификация</a>

            <h2>🔗 Основные эндпоинты</h2>
            
            <h3>Аутентификация</h3>
            <div class="endpoint">
                <span class="method post">POST</span> /api/auth/register - Регистрация пользователя
            </div>
            <div class="endpoint">
                <span class="method post">POST</span> /api/auth/login - Вход в систему
            </div>
            <div class="endpoint">
                <span class="method get">GET</span> /api/auth/me - Получение текущего пользователя
            </div>
            <div class="endpoint">
                <span class="method post">POST</span> /api/auth/refresh - Обновление токена
            </div>
            <div class="endpoint">
                <span class="method post">POST</span> /api/auth/logout - Выход из системы
            </div>

            <h3>Пользователи</h3>
            <div class="endpoint">
                <span class="method get">GET</span> /api/users - Получение списка пользователей
            </div>
            <div class="endpoint">
                <span class="method get">GET</span> /api/users/:id - Получение пользователя по ID
            </div>

            <h3>Мастера</h3>
            <div class="endpoint">
                <span class="method get">GET</span> /api/masters - Получение списка мастеров
            </div>
            <div class="endpoint">
                <span class="method get">GET</span> /api/masters/:id - Получение мастера по ID
            </div>

            <h2>🔐 Аутентификация</h2>
            <p>API использует JWT токены для аутентификации. Включите токен в заголовок Authorization:</p>
            <div class="endpoint">
                Authorization: Bearer &lt;your-jwt-token&gt;
            </div>

            <h2>📝 Примеры использования</h2>
            <p>Для подробных примеров запросов и ответов используйте интерактивную документацию Swagger UI.</p>

            <div class="info-box">
                <strong>Версия API:</strong> 1.0.0<br>
                <strong>Базовый URL:</strong> http://localhost:3000/api<br>
                <strong>Формат данных:</strong> JSON
            </div>
        </div>
    </body>
    </html>
  `);
});

export default docRouter;