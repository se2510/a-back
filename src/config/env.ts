import dotenv from 'dotenv';
dotenv.config();

export const PORT       = process.env.PORT       ?? '3000';
export const DB_HOST    = process.env.DB_HOST    ?? 'animastudioserver1.mysql.database.azure.com';
export const DB_PORT    = process.env.DB_PORT    ?? 3306;
export const DB_USER    = process.env.DB_USER    ?? 'root';
export const DB_PASS    = process.env.DB_PASS    ?? '';
export const DB_NAME    = process.env.DB_NAME    ?? 'ai_platform';
export const JWT_SECRET = process.env.JWT_SECRET ?? 'secret';
export const DB_SSL     = process.env.DB_SSL     ?? 'false';

export const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME ?? '';
export const AZURE_STORAGE_ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY ?? '';
export const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING ?? '';
export const AZURE_STORAGE_CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME ?? 'container';

export const RUNWAYML_API_SECRET = process.env.RUNWAYML_API_SECRET ?? '';
