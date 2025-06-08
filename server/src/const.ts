import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

// Константы для переменных окружения
export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = process.env.DB_PORT;
export const DB_NAME = process.env.DB_NAME;
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || '30d';
export const CORS_ORIGIN = process.env.CORS_ORIGIN;
export const NODE_ENV = process.env.NODE_ENV;
export const PORT = process.env.PORT;
export const DB_ENABLED = process.env.DB_ENABLED;
export const ROOT_PASSWORD = process.env.ROOT_PASSWORD;