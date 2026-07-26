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

// Services
import { IUserService } from '../services/interfaces/IUserService';
import { UserService } from '../services/classes/UserService';
import { IProjectService } from '../services/interfaces/IProjectService';
import { ProjectService } from '../services/classes/ProjectService';
import { IAssetService } from '../services/interfaces/IAssetService';
import { AssetService } from '../services/classes/AssetService';
import { IAuthService } from '../services/interfaces/IAuthService';
import { AuthService } from '../services/classes/AuthService';

// Controllers
import { AuthController } from '../controllers/AuthController';
import { UserController } from '../controllers/UserController';
import { ProjectController } from '../controllers/ProjectController';

import { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } from './env';

// Configuración de la fuente de datos de TypeORM
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  entities: [__dirname + '/../entities/*.{ts,js}'],
  synchronize: true,
  ssl: {
    rejectUnauthorized: false,
  },
  logging: process.env.NODE_ENV === 'development'
});

// Registrar instancias singleton
container.registerInstance(DataSource, AppDataSource);

// Registrar repositorios
container.registerSingleton<IUserRepository>('IUserRepository', UserRepository);
container.registerSingleton<IProjectRepository>('IProjectRepository', ProjectRepository);
container.registerSingleton<IAssetRepository>('IAssetRepository', AssetRepository);

// Registrar servicios
import { TokenBlacklistService } from '../services/TokenBlacklistService';

container.registerSingleton('TokenBlacklistService', TokenBlacklistService);
container.registerSingleton<IUserService>('IUserService', UserService);
container.registerSingleton<IProjectService>('IProjectService', ProjectService);
container.registerSingleton<IAssetService>('IAssetService', AssetService);

// Registrar AuthService
container.registerSingleton<IAuthService>('IAuthService', AuthService);

// Registrar controladores
container.registerSingleton('AuthController', AuthController);
container.registerSingleton('UserController', UserController);
container.registerSingleton('ProjectController', ProjectController);

export { container };
