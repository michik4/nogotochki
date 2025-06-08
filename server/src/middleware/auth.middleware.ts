import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, JwtPayload } from '../utils/jwt';

// Расширение интерфейса Request для добавления пользователя
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Middleware для проверки аутентификации
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        error: 'Токен доступа не предоставлен',
        code: 'NO_TOKEN'
      });
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      error: error instanceof Error ? error.message : 'Недействительный токен',
      code: 'INVALID_TOKEN'
    });
  }
};

// Middleware для проверки роли пользователя
export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Пользователь не аутентифицирован',
        code: 'NOT_AUTHENTICATED'
      });
      return;
    }

    const userRole = req.user.type;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        error: 'Недостаточно прав доступа',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: userRole
      });
      return;
    }

    next();
  };
};

// Middleware для проверки, что пользователь - мастер
export const requireMaster = requireRole('master');

// Middleware для проверки, что пользователь - клиент
export const requireClient = requireRole('client');

// Middleware для проверки, что пользователь - администратор
export const requireAdmin = requireRole('admin');

// Middleware для проверки, что пользователь - мастер или администратор
export const requireMasterOrAdmin = requireRole(['master', 'admin']);

// Middleware для проверки, что пользователь может редактировать ресурс
export const requireOwnershipOrAdmin = (getUserIdFromParams: (req: Request) => string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Пользователь не аутентифицирован',
        code: 'NOT_AUTHENTICATED'
      });
      return;
    }

    const currentUserId = req.user.userId;
    const targetUserId = getUserIdFromParams(req);
    const isAdmin = req.user.type === 'admin';

    if (currentUserId !== targetUserId && !isAdmin) {
      res.status(403).json({
        error: 'Можно редактировать только свои данные',
        code: 'OWNERSHIP_REQUIRED'
      });
      return;
    }

    next();
  };
};

// Middleware для опциональной аутентификации (не требует токен)
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Игнорируем ошибки токена в опциональной аутентификации
    next();
  }
}; 