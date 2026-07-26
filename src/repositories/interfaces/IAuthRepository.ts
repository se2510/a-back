export interface IAuthRepository
{
    Login(username: string, password: string): Promise<string>;
    Register(username: string, password: string): Promise<string>;
    Logout(): Promise<void>;
    ResetPassword(email: string): Promise<void>;
    VerifyEmail(token: string): Promise<void>;
}