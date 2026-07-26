import "reflect-metadata";
import { AuthController } from '../../../src/controllers/AuthController';
import { IAuthService } from '../../../src/services/interfaces/IAuthService';
import { IUserService } from '../../../src/services/interfaces/IUserService';
import { User } from '../../../src/entities/User';
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

// Mocks
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

// Mock para las variables de entorno
jest.mock('../config/env', () => ({
  JWT_SECRET: 'test-secret',
  JWT_EXPIRES_IN: '8h' // Actualizado para que coincida con la implementación real
}));

describe('AuthController', () => {
  describe('Login', () => {
    let controller: AuthController;
    let mockUserService: jest.Mocked<IUserService>;
    let mockAuthService: jest.Mocked<IAuthService>;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;
    let mockUser: User;

    beforeEach(() => {
      // Configuración de mocks
      mockUserService = {
        GetUserByUsername: jest.fn(),
        GetUserByEmail: jest.fn(),
        GetUsers: jest.fn(),
        GetUserById: jest.fn(),
        CreateUser: jest.fn(),
        UpdateUser: jest.fn(),
        DeleteUser: jest.fn()
      } as any;

      mockAuthService = {
        Register: jest.fn(),
        Login: jest.fn(),
        Logout: jest.fn(),
        ResetPassword: jest.fn(),
        VerifyEmail: jest.fn()
      } as any;

      // Crear instancia del controlador con los mocks
      controller = new AuthController(mockAuthService, mockUserService);
      
      // Configurar mocks para response
      statusMock = jest.fn().mockReturnThis();
      jsonMock = jest.fn();
      
      // Configurar request básico
      req = {
        body: {
          username: 'testuser',
          password: 'password123'
        }
      };
      
      res = {
        status: statusMock,
        json: jsonMock
      } as any;

      // Usuario de prueba
      mockUser = new User();
      mockUser.id = 1;
      mockUser.username = 'testuser';
      mockUser.email = 'test@example.com';
      mockUser.passwordHash = 'hashedpassword';
      mockUser.role = 'creator';
      mockUser.state = 'active';
      
      // Configurar mocks por defecto
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mocked-jwt-token');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    // 1. Pruebas de validación de entrada
    it('should return 400 if no username/email or password is provided', async () => {
      req.body = {}; // Sin credenciales
      
      await (controller as any).Login(req, res);
      
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Se requiere username/email y password'
      });
    });

    // 2. Pruebas de autenticación con username
    describe('when authenticating with username', () => {
      beforeEach(() => {
        mockUserService.GetUserByUsername.mockResolvedValue(mockUser);
        req.body = { username: 'testuser', password: 'password123' };
      });

      it('should return 401 if user is not found', async () => {
        mockUserService.GetUserByUsername.mockResolvedValue(null);
        
        await (controller as any).Login(req, res);
        
        expect(mockUserService.GetUserByUsername).toHaveBeenCalledWith('testuser');
        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({
          status: 'error',
          message: 'Credenciales inválidas'
        });
      });

      it('should return 401 if user is not active', async () => {
        // Usar 'as any' para evitar el error de tipo con el estado
        const inactiveUser = { ...mockUser } as any;
        inactiveUser.state = 'inactive';
        mockUserService.GetUserByUsername.mockResolvedValue(inactiveUser);
        
        await (controller as any).Login(req, res);
        
        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({
          status: 'error',
          message: 'Credenciales inválidas'
        });
      });

      it('should return 401 if password is invalid', async () => {
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);
        
        await (controller as any).Login(req, res);
        
        expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({
          status: 'error',
          message: 'Credenciales inválidas'
        });
      });

      it('should return 200 with JWT token if credentials are valid', async () => {
        await (controller as any).Login(req, res);
        
        expect(jwt.sign).toHaveBeenCalledWith(
          {
            sub: 1,
            username: 'testuser',
            email: 'test@example.com',
            role: 'creator'
          },
          'test-secret',
          { expiresIn: '8h' }
        );
        
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
          status: 'success',
          token: 'mocked-jwt-token'
        });
      });
    });

    // 3. Pruebas de autenticación con email
    describe('when authenticating with email', () => {
      beforeEach(() => {
        mockUserService.GetUserByEmail.mockResolvedValue(mockUser);
        req.body = { email: 'test@example.com', password: 'password123' };
      });

      it('should find user by email and return token if credentials are valid', async () => {
        await (controller as any).Login(req, res);
        
        expect(mockUserService.GetUserByEmail).toHaveBeenCalledWith('test@example.com');
        expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
          status: 'success',
          token: 'mocked-jwt-token'
        });
      });
    });

    // 4. Manejo de errores
    it('should handle unexpected errors and return 500', async () => {
      const error = new Error('Database error');
      mockUserService.GetUserByUsername.mockRejectedValue(error);
      
      await (controller as any).Login(req, res);
      
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Database error' // Usar el mensaje de error real
      });
    });
  });

  // Pruebas para RegisterUser
  describe('RegisterUser', () => {
    let registerController: AuthController;
    let registerAuthService: jest.Mocked<IAuthService>;
    let registerUserService: jest.Mocked<IUserService>;
    let registerReq: Partial<Request>;
    let registerRes: Partial<Response>;
    let registerStatusMock: jest.Mock;
    let registerJsonMock: jest.Mock;

    beforeEach(() => {
      // Configurar mocks específicos para RegisterUser
      registerUserService = {
        GetUserByUsername: jest.fn(),
        GetUserByEmail: jest.fn(),
        GetUsers: jest.fn(),
        GetUserById: jest.fn(),
        CreateUser: jest.fn(),
        UpdateUser: jest.fn(),
        DeleteUser: jest.fn()
      } as any;

      registerAuthService = {
        Register: jest.fn().mockResolvedValue('OK'),
        Login: jest.fn(),
        Logout: jest.fn(),
        ResetPassword: jest.fn(),
        VerifyEmail: jest.fn()
      } as any;

      // Crear instancia del controlador con los mocks
      registerController = new AuthController(registerAuthService, registerUserService);
      
      // Configurar request y response para RegisterUser
      registerReq = { body: {} };
      registerStatusMock = jest.fn().mockReturnThis();
      registerJsonMock = jest.fn();
      registerRes = {
        status: registerStatusMock,
        json: registerJsonMock
      } as any;
    });

    it('should register user and return 201 with user data if input is valid', async () => {
      const userData = JSON.stringify({ 
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'creator',
        state: 'active'
      });
      
      registerReq.body = { 
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'creator'
      };

      registerAuthService.Register.mockResolvedValue(userData);
      
      // Mock para el parseo del JSON en el controlador
      jest.spyOn(JSON, 'parse').mockReturnValue(JSON.parse(userData));

      await (registerController as any).RegisterUser(registerReq, registerRes);
      
      expect(registerAuthService.Register).toHaveBeenCalledWith(expect.objectContaining({
        username: 'testuser',
        email: 'test@example.com',
        role: 'creator'
      }));
      expect(registerStatusMock).toHaveBeenCalledWith(201);
      // Verificar que se llamó con los argumentos correctos
      expect(registerJsonMock).toHaveBeenCalledWith(expect.objectContaining({
        status: 'success',
        data: expect.objectContaining({
          username: 'testuser',
          email: 'test@example.com',
          role: 'creator'
        })
      }));
    });

    it('should return 400 if required fields are missing', async () => {
      registerReq.body = {}; // Sin campos requeridos
      
      await (registerController as any).RegisterUser(registerReq, registerRes);
      
      expect(registerStatusMock).toHaveBeenCalledWith(400);
      expect(registerJsonMock).toHaveBeenCalledWith(expect.objectContaining({
        status: 'error'
      }));
    });

    it('should return 400 if registration fails with validation error', async () => {
      const error = new Error('Validation failed');
      (error as any).statusCode = 400;
      (error as any).errors = [];
      
      registerAuthService.Register.mockRejectedValue(error);
      registerReq.body = { 
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'creator'
      };
      
      await (registerController as any).RegisterUser(registerReq, registerRes);
      
      expect(registerStatusMock).toHaveBeenCalledWith(400);
      expect(registerJsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Validation failed',
        errors: []
      });
    });
    
    it('should return 500 if registration fails with server error', async () => {
      const error = new Error('Database connection failed');
      (error as any).statusCode = 500;
      
      registerAuthService.Register.mockRejectedValue(error);
      registerReq.body = { 
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'creator'
      };
      
      await (registerController as any).RegisterUser(registerReq, registerRes);
      
      expect(registerStatusMock).toHaveBeenCalledWith(500);
      expect(registerJsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Database connection failed'
      });
    });
  });
});
