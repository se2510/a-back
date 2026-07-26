import { Request, Response, Router } from 'express';
import { inject, injectable } from 'tsyringe';
import { IAuthService } from '../services/interfaces/IAuthService';
import { IUserService } from '../services/interfaces/IUserService';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UserCreateDto } from '../dtos/users/UserCreateDto';
import { ResetPasswordRequestDto, ResetPasswordConfirmDto } from '../dtos/users/ResetPasswordDto';
import { UserResponseDto } from '../dtos/users/UserResponseDto';
import crypto from 'crypto';
import { promisify } from 'util';
import { sendResetPasswordEmail } from '../utils/emailService.js';

type AsyncRequestHandler = (req: Request, res: Response) => Promise<void>;

@injectable()
export class AuthController 
{
  private router: Router;

  constructor(
    @inject('IAuthService') private readonly authService: IAuthService,
    @inject('IUserService') private readonly userService: IUserService
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/register', async (req: Request, res: Response) => {
      await this.RegisterUser(req, res);
    });
    
    this.router.post('/login', async (req: Request, res: Response) => {
      await this.Login(req, res);
    });
    
    this.router.post('/reset-password', async (req: Request, res: Response) => {
      await this.ResetPassword(req, res);
    });
    
    this.router.post('/reset-password/confirm', async (req: Request, res: Response) => {
      await this.ConfirmResetPassword(req, res);
    });
    
    this.router.post('/logout', async (req: Request, res: Response) => {
      await this.Logout(req, res);
    });
    
    this.router.post('/verify-email', async (req: Request, res: Response) => {
      await this.VerifyEmail(req, res);
    });
  }

  private mapUserToResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
  }

  public async RegisterUser(req: Request, res: Response): Promise<void> {
    try {
      // Validar los datos de entrada
      const userDto = plainToInstance(UserCreateDto, req.body);
      const errors = await validate(userDto);

      if (errors.length > 0) {
        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.map(e => Object.values(e.constraints || {})).flat()
        });
        return;
      }

      // Registrar al usuario
      await this.authService.Register(userDto as any);
      
      // No devolvemos la contraseña en la respuesta
      const response = this.mapUserToResponse(userDto);
      
      res.status(201).json({
        status: 'success',
        data: response
      });
    } catch (error: any) {
      // Si es un error de validación, devolver 400
      if (error.statusCode === 400 || error.message.includes('Validation failed')) {
        res.status(400).json({
          status: 'error',
          message: error.message || 'Validation failed',
          errors: error.errors || []
        });
      } else {
        // Para otros errores, devolver 500
        console.error('Registration error:', error);
        res.status(500).json({
          status: 'error',
          message: error.message || 'An error occurred during registration'
        });
      }
    }
  }

  public async Login(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;
      
      if ((!username && !email) || !password) {
        res.status(400).json({
          status: 'error',
          message: 'Se requiere username/email y password'
        });
        return;
      }

      const result = await this.authService.Login(username || email, password);
      
      if (result.success) {
        res.status(200).json({
          status: 'success',
          token: result.token
        });
      } else {
        res.status(401).json({
          status: 'error',
          message: result.message || 'Credenciales inválidas'
        });
      }
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Internal server error'
      });
    }
  }

  public async ResetPassword(req: Request, res: Response): Promise<void> {
    try {
      // Verificar si es una solicitud de inicio de restablecimiento o confirmación
      if (req.body.email) {
        await this.handleResetPasswordRequest(req, res);
      } else if (req.body.token && req.body.newPassword) {
        await this.handleResetPasswordConfirm(req, res);
      } else {
        res.status(400).json({
          status: 'error',
          message: 'Solicitud inválida. Se requiere email o token con nueva contraseña.'
        });
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Ocurrió un error al procesar la solicitud de restablecimiento de contraseña.'
      });
    }
  }

  private async handleResetPasswordRequest(req: Request, res: Response): Promise<void> {
    try {
      const resetDto = plainToInstance(ResetPasswordRequestDto, req.body);
      const errors = await validate(resetDto);

      if (errors.length > 0) {
        res.status(400).json({
          status: 'error',
          message: 'Validación fallida',
          errors: errors.map(e => Object.values(e.constraints || {})).flat()
        });
        return;
      }

      await this.authService.RequestPasswordReset(resetDto.email);
      
      // Por seguridad, no revelamos si el email existe o no
      res.status(200).json({
        status: 'success',
        message: 'Si el correo existe, se ha enviado un enlace para restablecer la contraseña.'
      });
    } catch (error: any) {
      console.error('Error en handleResetPasswordRequest:', error);
      
      // Si el error ya tiene una respuesta, no hacer nada más
      if (res.headersSent) {
        return;
      }
      
      // Si no se ha enviado respuesta, enviar error 500
      res.status(500).json({
        status: 'error',
        message: 'Ocurrió un error al procesar la solicitud de restablecimiento de contraseña.'
      });
    }
  }

  private async handleResetPasswordConfirm(req: Request, res: Response): Promise<void> {
    const { token, newPassword } = req.body;

    try {
      // Confirmar restablecimiento de contraseña
      await this.authService.ResetPassword(token, newPassword);

      res.status(200).json({
        status: 'success',
        message: 'Contraseña restablecida exitosamente'
      });
    } catch (error) {
      console.error('Error al solicitar restablecimiento de contraseña:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al procesar la solicitud de restablecimiento de contraseña'
      });
    }
  }

  private clearTokenCookie(res: Response): void {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
  }

  public async Logout(req: Request, res: Response): Promise<void> {
    try {
      // Intentar obtener el token del encabezado Authorization o de las cookies
      let token: string | undefined;
      
      // 1. Intentar obtener del encabezado Authorization
      const authHeader = req.headers.authorization;
      if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } 
      // 2. Si no está en el encabezado, intentar obtener de las cookies
      else if (req.cookies?.token) {
        token = req.cookies.token;
      }

      // Limpiar la cookie en cualquier caso
      this.clearTokenCookie(res);

      if (!token) {
        res.status(200).json({ 
          status: 'success', 
          message: 'No active session found, cookie cleared' 
        });
        return;
      }
      
      try {
        await this.authService.Logout(token);
        res.status(200).json({ 
          status: 'success', 
          message: 'Successfully logged out' 
        });
      } catch (error) {
        // Si hay error en el logout, igual respondemos éxito
        res.status(200).json({ 
          status: 'success', 
          message: 'Session terminated' 
        });
      }
    } catch (error: any) {
      this.clearTokenCookie(res);
      res.status(500).json({
        status: 'error',
        message: 'An unexpected error occurred during logout',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  public async ConfirmResetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        res.status(400).json({
          status: 'error',
          message: 'Token y nueva contraseña son requeridos'
        });
        return;
      }

      await this.authService.ResetPassword(token, newPassword);
      
      res.status(200).json({
        status: 'success',
        message: 'Contraseña actualizada correctamente'
      });
    } catch (error: any) {
      console.error('Error al confirmar restablecimiento de contraseña:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Error al actualizar la contraseña'
      });
    }
  }

  public async VerifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token, email } = req.body;
      
      if (!token || !email) {
        res.status(400).json({
          status: 'error',
          message: 'Token y correo electrónico son requeridos'
        });
        return;
      }

      const result = await this.authService.VerifyEmail(email, token);
      
      if (result.success) {
        res.status(200).json({
          status: 'success',
          message: result.message
        });
      } else {
        res.status(400).json({
          status: 'error',
          message: result.message
        });
      }
    } catch (error: any) {
      console.error('Error en la verificación de correo electrónico:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor al verificar el correo electrónico',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
 
}
