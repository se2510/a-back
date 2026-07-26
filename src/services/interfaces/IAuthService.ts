import { UserCreateDto } from "../../dtos/users/UserCreateDto";

export interface IAuthService 
{
    Login(usernameOrEmail: string, password: string): Promise<{ 
      success: boolean;
      token?: string;
      message?: string;
      expiresIn?: number;
    }>;
    Register(userData: UserCreateDto): Promise<string>;
    RequestPasswordReset(email: string): Promise<void>;
    ResetPassword(token: string, newPassword: string): Promise<void>;
    VerifyEmail(email: string, token: string): Promise<{ success: boolean; message: string }>;
    Logout(token: string): Promise<void>;
}