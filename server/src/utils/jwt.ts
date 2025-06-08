import jwt, { SignOptions } from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../const';

export interface JwtPayload {
  userId: string;
  email: string;
  type: 'client' | 'master' | 'admin';
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Генерация access токена
export const generateAccessToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  const secret = JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET не установлен в переменных окружения');
  }

  // Дополнительная проверка JWT_EXPIRES_IN
  if (!JWT_EXPIRES_IN) {
    throw new Error('JWT_EXPIRES_IN не установлен в переменных окружения');
  }

  // Проверка формата времени истечения
  if (!validateExpiresIn(JWT_EXPIRES_IN)) {
    throw new Error(`Некорректный формат JWT_EXPIRES_IN: ${JWT_EXPIRES_IN}. Используйте формат: 30d, 24h, 60m, 3600s или просто число секунд`);
  }

  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as any,
    issuer: 'nailmasters-api',
    audience: 'nailmasters-client'
  };

  return jwt.sign(payload, secret, options);
};

// Генерация refresh токена (более длительный срок)
export const generateRefreshToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET не установлен в переменных окружения');
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '90d', // 3 месяца
    issuer: 'nailmasters-api',
    audience: 'nailmasters-client'
  });
};

// Генерация пары токенов
export const generateTokenPair = (payload: Omit<JwtPayload, 'iat' | 'exp'>): TokenPair => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};

// Верификация токена
export const verifyToken = (token: string): JwtPayload => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET не установлен в переменных окружения');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'nailmasters-api',
      audience: 'nailmasters-client'
    }) as JwtPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Токен истек');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Недействительный токен');
    } else {
      throw new Error('Ошибка верификации токена');
    }
  }
};

// Декодирование токена без верификации (для отладки)
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
};

// Проверка истечения токена
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

// Извлечение токена из заголовка Authorization
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

// Валидация формата времени истечения токена
export const validateExpiresIn = (expiresIn: string | number): boolean => {
  if (typeof expiresIn === 'number') {
    return expiresIn > 0;
  }

  if (typeof expiresIn === 'string') {
    // Проверяем формат: число + единица времени (s, m, h, d, w, y) или просто число
    const timePattern = /^(\d+)([smhdwy]?)$|^\d+$/;
    return timePattern.test(expiresIn);
  }

  return false;
};

// Получение времени истечения в секундах (для отладки)
export const getExpiresInSeconds = (expiresIn: string | number): number => {
  if (typeof expiresIn === 'number') {
    return expiresIn;
  }

  const match = expiresIn.match(/^(\d+)([smhdwy]?)$/);
  if (!match) {
    return parseInt(expiresIn) || 0;
  }

  const value = parseInt(match[1]);
  const unit = match[2] || 's';

  const multipliers: { [key: string]: number } = {
    's': 1,
    'm': 60,
    'h': 3600,
    'd': 86400,
    'w': 604800,
    'y': 31536000
  };

  return value * (multipliers[unit] || 1);
}; 