import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { generateTokenPair, verifyToken } from '../utils/jwt';
import { comparePassword, validatePassword } from '../utils/password';
import { CreateUserData, LoginCredentials } from '../models/User';
import { ROOT_PASSWORD } from '../const';

const userService = new UserService();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     description: Создает нового пользователя (клиента или мастера) в системе
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             client:
 *               summary: Регистрация клиента
 *               value:
 *                 email: "client@example.com"
 *                 password: "password123"
 *                 name: "Анна Иванова"
 *                 phone: "+7 (999) 123-45-67"
 *                 role: "client"
 *                 location: "Москва"
 *             master:
 *               summary: Регистрация мастера
 *               value:
 *                 email: "master@example.com"
 *                 password: "password123"
 *                 name: "Мария Петрова"
 *                 phone: "+7 (999) 987-65-43"
 *                 role: "master"
 *                 location: "Санкт-Петербург"
 *                 specialties: ["маникюр", "педикюр", "наращивание"]
 *             admin:
 *               summary: Регистрация администратора
 *               value:
 *                 email: "admin@example.com"
 *                 password: "password123"
 *                 name: "Администратор Системы"
 *                 phone: "+7 (999) 000-00-00"
 *                 role: "admin"
 *                 rootPassword: "your-root-password"
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Ошибка валидации данных
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Пользователь с таким email уже существует
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
// Регистрация пользователя
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, name, phone, role, location, specialties, rootPassword }: CreateUserData = req.body;
        // Валидация входных данных
        if (!email || !password || !name || !phone || !role) {
            res.status(400).json({
                error: 'Обязательные поля: email, password, name, phone, role',
                code: 'MISSING_REQUIRED_FIELDS'
            });
            return;
        }

        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                error: 'Некорректный формат email',
                code: 'INVALID_EMAIL'
            });
            return;
        }

        // Валидация пароля
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            res.status(400).json({
                error: 'Пароль не соответствует требованиям',
                code: 'INVALID_PASSWORD',
                details: passwordValidation.errors
            });
            return;
        }

            // Валидация роли пользователя
    if (!['client', 'master', 'admin'].includes(role)) {
      res.status(400).json({
        error: 'Роль пользователя должна быть client, master или admin',
        code: 'INVALID_USER_ROLE'
      });
      return;
    }

    // Проверка root пароля для администраторов
    if (role === 'admin') {
      if (!rootPassword) {
        res.status(400).json({
          error: 'Для регистрации администратора требуется root пароль',
          code: 'ROOT_PASSWORD_REQUIRED'
        });
        return;
      }

      if (!ROOT_PASSWORD) {
        res.status(500).json({
          error: 'Root пароль не настроен в системе',
          code: 'ROOT_PASSWORD_NOT_CONFIGURED'
        });
        return;
      }

      if (rootPassword !== ROOT_PASSWORD) {
        res.status(403).json({
          error: 'Неверный root пароль',
          code: 'INVALID_ROOT_PASSWORD'
        });
        return;
      }
    }

        // Создание пользователя
        const user = await userService.createUser({
            email,
            password,
            name,
            phone,
            role: role as 'client' | 'master' | 'admin',
            location,
            specialties
        });

        // Генерация токенов
        const tokens = generateTokenPair({
            userId: user.id,
            email: user.email,
            type: user.type as 'client' | 'master'
        });

        // Возвращаем данные пользователя без пароля
        const { passwordHash, ...userWithoutPassword } = user;

        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            user: userWithoutPassword,
            tokens,
            success: true
        });
    } catch (error) {
        console.error('Ошибка регистрации:', error);

        if (error instanceof Error && error.message.includes('уже существует')) {
            res.status(409).json({
                error: error.message,
                code: 'USER_ALREADY_EXISTS'
            });
        } else {
            res.status(500).json({
                error: 'Внутренняя ошибка сервера',
                code: 'INTERNAL_SERVER_ERROR'
            });
        }
    }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Вход пользователя в систему
 *     description: Аутентификация пользователя по email и паролю
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "user@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Успешная аутентификация
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Отсутствуют обязательные поля
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Неверные учетные данные
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
// Вход пользователя
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password }: LoginCredentials = req.body;

        // Валидация входных данных
        if (!email || !password) {
            res.status(400).json({
                error: 'Email и пароль обязательны',
                code: 'MISSING_CREDENTIALS'
            });
            return;
        }

        // Поиск пользователя
        const user = await userService.findByEmail(email);
        if (!user) {
            res.status(401).json({
                error: 'Неверный email или пароль',
                code: 'INVALID_CREDENTIALS'
            });
            return;
        }

        // Проверка пароля
        const isPasswordValid = await comparePassword(password, user.passwordHash);
        if (!isPasswordValid) {
            res.status(401).json({
                error: 'Неверный email или пароль',
                code: 'INVALID_CREDENTIALS'
            });
            return;
        }

        // Генерация токенов
        const tokens = generateTokenPair({
            userId: user.id,
            email: user.email,
            type: user.type as 'client' | 'master' | 'admin'
        });

        // Получение полного профиля пользователя
        let fullProfile;
        if (user.type === 'client') {
            fullProfile = await userService.getClientProfile(user.id);
        } else if (user.type === 'master') {
            fullProfile = await userService.getMasterProfile(user.id);
        } else {
            fullProfile = user;
        }

        // Возвращаем данные пользователя без пароля
        const { passwordHash, ...userWithoutPassword } = fullProfile || user;

        res.json({
            message: 'Успешный вход в систему',
            user: userWithoutPassword,
            tokens,
            success: true
        });
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({
            error: 'Внутренняя ошибка сервера',
            code: 'INTERNAL_SERVER_ERROR'
        });
    }
};

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Получение информации о текущем пользователе
 *     description: Возвращает данные аутентифицированного пользователя
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные пользователя получены успешно
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/Client'
 *                     - $ref: '#/components/schemas/Master'
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Пользователь не аутентифицирован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Пользователь не найден
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
// Получение текущего пользователя
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                error: 'Пользователь не аутентифицирован',
                code: 'NOT_AUTHENTICATED'
            });
            return;
        }

        const userId = req.user.userId;
        const userType = req.user.type;

        // Получение полного профиля пользователя
        let user;
        if (userType === 'client') {
            user = await userService.getClientProfile(userId);
        } else if (userType === 'master') {
            user = await userService.getMasterProfile(userId);
        } else {
            user = await userService.findById(userId);
        }

        if (!user) {
            res.status(404).json({
                error: 'Пользователь не найден',
                code: 'USER_NOT_FOUND'
            });
            return;
        }

        // Возвращаем данные пользователя без пароля
        const { passwordHash, ...userWithoutPassword } = user;

        res.json({
            user: userWithoutPassword,
            success: true
        });
    } catch (error) {
        console.error('Ошибка получения пользователя:', error);
        res.status(500).json({
            error: 'Внутренняя ошибка сервера',
            code: 'INTERNAL_SERVER_ERROR'
        });
    }
};

// Обновление токена
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({
                error: 'Refresh token обязателен',
                code: 'MISSING_REFRESH_TOKEN'
            });
            return;
        }

        // Верификация refresh токена
        const decoded = verifyToken(refreshToken);

        // Проверяем, существует ли пользователь
        const user = await userService.findById(decoded.userId);
        if (!user) {
            res.status(401).json({
                error: 'Пользователь не найден',
                code: 'USER_NOT_FOUND'
            });
            return;
        }

        // Генерация новых токенов
        const tokens = generateTokenPair({
            userId: user.id,
            email: user.email,
            type: user.type as 'client' | 'master' | 'admin'
        });

        res.json({
            message: 'Токены успешно обновлены',
            tokens,
            success: true
        });
    } catch (error) {
        console.error('Ошибка обновления токена:', error);
        res.status(401).json({
            error: 'Недействительный refresh token',
            code: 'INVALID_REFRESH_TOKEN'
        });
    }
};

// Выход из системы (в будущем можно добавить blacklist токенов)
export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        // В текущей реализации просто возвращаем успех
        // В продакшене здесь можно добавить токен в blacklist
        res.json({
            message: 'Успешный выход из системы',
            success: true
        });
    } catch (error) {
        console.error('Ошибка выхода:', error);
        res.status(500).json({
            error: 'Внутренняя ошибка сервера',
            code: 'INTERNAL_SERVER_ERROR'
        });
    }
};
