import { Router } from 'express';
import { register, login, getCurrentUser, refreshToken, logout } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const authRouter = Router();

// POST /auth/register - Регистрация пользователя
authRouter.post('/register', register);

// POST /auth/login - Вход пользователя
authRouter.post('/login', login);

// GET /auth/me - Получение текущего пользователя (требует аутентификации)
authRouter.get('/me', authenticateToken, getCurrentUser);

// POST /auth/refresh - Обновление токена
authRouter.post('/refresh', refreshToken);

// POST /auth/logout - Выход из системы
authRouter.post('/logout', logout);

export default authRouter;