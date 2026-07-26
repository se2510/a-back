import 'reflect-metadata';
import { container } from 'tsyringe';
import { DataSource } from 'typeorm';

// Repositories
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { UserRepository } from '../repositories/classes/UserRepository';
import { IProjectRepository } from '../repositories/interfaces/IProjectRepository';
import { ProjectRepository } from '../repositories/classes/ProjectRepository';
import { IAssetRepository } from '../repositories/interfaces/IAssetRepository';
import { AssetRepository } from '../repositories/classes/AssetRepository';
import { IGenerativeAIRepository } from '../repositories/interfaces/IGenerativeAIRepository';
import { GenerativeAIRepository } from '../repositories/classes/GenerativeAIRepository';

// Services
import { IUserService } from '../services/interfaces/IUserService';
import { UserService } from '../services/classes/UserService';
import { IProjectService } from '../services/interfaces/IProjectService';
import { ProjectService } from '../services/classes/ProjectService';
import { IAssetService } from '../services/interfaces/IAssetService';
import { AssetService } from '../services/classes/AssetService';
import { IGenerativeAIService } from '../services/interfaces/IGenerativeAIService';
import { GenerativeAIService } from '../services/classes/GenerativeAIService';
import { IBlobStorageService } from '../services/interfaces/IBlobStorageService';
import { BlobStorageService } from '../services/classes/BlobStorageService';
import { IAuthService } from '../services/interfaces/IAuthService';
import { AuthService } from '../services/classes/AuthService';
import { IAdminService } from '../services/interfaces/IAdminService';
import { AdminService } from '../services/classes/AdminService';
import { TokenBlacklistService } from '../services/TokenBlacklistService';

// Providers
import { RunwayMLProvider } from '../providers/classes/RunwayMLProvider';
import { MediaProviderRegistry } from '../providers/classes/MediaProviderRegistry';
import { IMediaProviderRegistry } from '../providers/interfaces/IMediaProviderRegistry';
import { IVideoProvider } from '../providers/interfaces/IVideoProvider';

// Controllers
import { AuthController } from '../controllers/AuthController';
import { UserController } from '../controllers/UserController';
import { ProjectController } from '../controllers/ProjectController';

// Env
import {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASS,
  DB_NAME,
  DB_SSL,
  AZURE_STORAGE_ACCOUNT_NAME,
  AZURE_STORAGE_CONTAINER_NAME,
  AZURE_STORAGE_ACCOUNT_KEY,
} from './env';

// Configuración de TypeORM
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  entities: [__dirname + '/../entities/*.{ts,js}'],
  synchronize: false,
  ssl: DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  logging: process.env.NODE_ENV === 'development',
});

// Registrar instancia de DataSource
container.registerInstance(DataSource, AppDataSource);

// Registrar Repositories
container.registerSingleton<IUserRepository>('IUserRepository', UserRepository);
container.registerSingleton<IProjectRepository>('IProjectRepository', ProjectRepository);
container.registerSingleton<IAssetRepository>('IAssetRepository', AssetRepository);
container.registerSingleton<IGenerativeAIRepository>('IGenerativeAIRepository', GenerativeAIRepository);

// Registrar Services
container.registerSingleton<IUserService>('IUserService', UserService);
container.registerSingleton<IProjectService>('IProjectService', ProjectService);
container.registerSingleton<IAssetService>('IAssetService', AssetService);
container.registerSingleton<IGenerativeAIService>('IGenerativeAIService', GenerativeAIService);
container.registerSingleton<IBlobStorageService>('IBlobStorageService', BlobStorageService);
container.registerSingleton<IAuthService>('IAuthService', AuthService);
container.registerSingleton<IAdminService>('IAdminService', AdminService);
container.registerSingleton('TokenBlacklistService', TokenBlacklistService);

// Registrar Providers
container.registerSingleton<IVideoProvider>('RunwayMLProvider', RunwayMLProvider);
container.registerSingleton<IMediaProviderRegistry>('IMediaProviderRegistry', MediaProviderRegistry);

// Registrar Controladores
container.registerSingleton('AuthController', AuthController);
container.registerSingleton('UserController', UserController);
container.registerSingleton('ProjectController', ProjectController);

// Registrar configuración de Azure Blob Storage
container.register('AZURE_BLOB_CONFIG', {
  useValue: {
    accountName: AZURE_STORAGE_ACCOUNT_NAME,
    containerName: AZURE_STORAGE_CONTAINER_NAME,
    accountKey: AZURE_STORAGE_ACCOUNT_KEY,
  },
});

export { container };
