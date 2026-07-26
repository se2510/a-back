import { injectable, inject } from 'tsyringe';
import { UserCreateDto } from "../../dtos/users/UserCreateDto";
import { IAuthService } from "../interfaces/IAuthService";
import { IUserService } from "../interfaces/IUserService";
import { User } from "../../entities/User";
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET, FRONTEND_URL } from '../../config/env';
import { TokenBlacklistService } from '../TokenBlacklistService';
import * as crypto from 'crypto';
import { promisify } from 'util';
import emailService from '../../utils/emailService';

@injectable()
export class AuthService implements IAuthService 
{
    constructor(
        @inject('IUserService') private userService: IUserService,
        @inject('TokenBlacklistService') private tokenBlacklist: TokenBlacklistService
    ) {}

    async Login(usernameOrEmail: string, password: string): Promise<{ success: boolean; token?: string; message?: string; expiresIn?: number }> {
        try {
            // Buscar usuario por username o email
            let user;
            if (usernameOrEmail.includes('@')) {
                user = await this.userService.GetUserByEmail(usernameOrEmail);
            } else {
                user = await this.userService.GetUserByUsername(usernameOrEmail);
            }

            if (!user) {
                return { 
                    success: false, 
                    message: 'Usuario o contraseña inválidos' 
                };
            }

            // Verificar contraseña
            const valid = await bcrypt.compare(password, user.passwordHash);
            if (!valid) {
                return { 
                    success: false, 
                    message: 'Usuario o contraseña inválidos' 
                };
            }

            // Verificar si el correo está verificado
            if (user.state !== 'active') {
                return { 
                    success: false, 
                    message: 'Por favor verifica tu correo electrónico antes de iniciar sesión' 
                };
            }

            // Generar token JWT
            const expiresIn = 60 * 60 * 8; // 8 horas
            const token = jwt.sign(
                { 
                    sub: user.id, 
                    username: user.username, 
                    email: user.email,
                    role: user.role
                },
                JWT_SECRET,
                { expiresIn }
            );

            return { 
                success: true,
                token, 
                expiresIn 
            };
        } catch (error) {
            console.error('Error en el servicio de autenticación:', error);
            return { 
                success: false, 
                message: 'Error al intentar iniciar sesión' 
            };
        }
    }

    async Register(userData: UserCreateDto): Promise<string> {
        // Verificar si el usuario ya existe
        const existingUser = await this.userService.GetUserByEmail(userData.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Validar el rol
        if (userData.role !== 'admin' && userData.role !== 'creator') {
            throw new Error('Invalid role. Must be either "admin" or "creator"');
        }

        // Hashear la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        // Crear el nuevo usuario
        const newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
            username: userData.username,
            email: userData.email,
            passwordHash: hashedPassword,
            role: userData.role as 'admin' | 'creator',
            state: 'pending_verification', // Estado inicial hasta verificar el correo
        };

        const createdUser = await this.userService.CreateUser(newUser);
        
        // Generar token de verificación
        const randomBytes = promisify(crypto.randomBytes);
        const verificationToken = (await randomBytes(32)).toString('hex');
        const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas de validez
        
        // Guardar token en el usuario usando el campo resetPasswordToken
        await this.userService.savePasswordResetToken(
          createdUser.id, 
          verificationToken, 
          verificationExpiry
        );
        
        // Enviar correo de verificación
        const verificationUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;
        await emailService.sendVerificationEmail(createdUser.email, verificationUrl);
        
        return 'Usuario registrado exitosamente. Por favor verifica tu correo electrónico.';
    }

    async RequestPasswordReset(email: string): Promise<void> {
        const user = await this.userService.GetUserByEmail(email);
        
        // Por seguridad, no revelamos si el email existe o no
        if (!user) {
            return;
        }

        // Generar token de restablecimiento
        const randomBytes = promisify(crypto.randomBytes);
        const resetToken = (await randomBytes(32)).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora de validez
        
        // Guardar token en el usuario
        await this.userService.savePasswordResetToken(user.id, resetToken, resetTokenExpiry);
        
        // Enviar correo con el enlace de restablecimiento
        const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
        await emailService.sendResetPasswordEmail(user.email, resetUrl);
    }

    async ResetPassword(token: string, newPassword: string): Promise<void> {
        // Buscar usuario por token
        const user = await this.userService.getUserByResetToken(token);
        
        if (!user) {
            throw new Error('Token de restablecimiento inválido o expirado');
        }

        // Verificar que el token no haya expirado
        if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            throw new Error('El enlace de restablecimiento ha expirado');
        }

        // Hashear la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Actualizar la contraseña y limpiar el token
        await this.userService.UpdateUser(user.id, {
            passwordHash: hashedPassword,
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined
        });
    }

    async VerifyEmail(email: string, token: string): Promise<{ success: boolean; message: string }> {
        try {
            // Buscar usuario por email
            const user = await this.userService.GetUserByEmail(email);
            if (!user) {
                return { success: false, message: 'Usuario no encontrado' };
            }

            // Verificar si el token coincide y no ha expirado
            if (user.resetPasswordToken !== token || !user.resetPasswordExpires) {
                return { success: false, message: 'Token de verificación inválido' };
            }

            if (user.resetPasswordExpires < new Date()) {
                return { success: false, message: 'El enlace de verificación ha expirado' };
            }

            // Actualizar el estado del usuario a activo
            await this.userService.UpdateUser(user.id, {
                state: 'active',
                resetPasswordToken: undefined,
                resetPasswordExpires: undefined
            });

            return { 
                success: true, 
                message: 'Correo electrónico verificado exitosamente. Tu cuenta ha sido activada.' 
            };
        } catch (error) {
            console.error('Error al verificar el correo electrónico:', error);
            return { 
                success: false, 
                message: 'Ocurrió un error al verificar el correo electrónico' 
            };
        }
    }

    async Logout(token: string): Promise<void> {
        try {
            const decoded = jwt.decode(token) as { exp?: number };
            if (!decoded?.exp) return;

            const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
            if (expiresIn > 0) {
                await this.tokenBlacklist.addToBlacklist(token, expiresIn);
            }
        } catch (error) {
            console.error('Logout error:', error);
            throw new Error('Error during logout');
        }
    }
}