import bcrypt from 'bcryptjs';

// Количество раундов для хеширования
const SALT_ROUNDS = 12;

// Хеширование пароля
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error('Ошибка при хешировании пароля');
  }
};

// Проверка пароля
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Ошибка при проверке пароля');
  }
};

// Валидация пароля
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Минимальная длина
  if (password.length < 8) {
    errors.push('Пароль должен содержать минимум 8 символов');
  }

  // Максимальная длина
  if (password.length > 128) {
    errors.push('Пароль не должен превышать 128 символов');
  }

  // Наличие цифр
  if (!/\d/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну цифру');
  }

  // Наличие букв
  if (!/[a-zA-Zа-яА-Я]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну букву');
  }

  // Наличие специальных символов (опционально)
  // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
  //   errors.push('Пароль должен содержать хотя бы один специальный символ');
  // }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Генерация случайного пароля
export const generateRandomPassword = (length: number = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}; 