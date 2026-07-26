
import { IAuthRepository } from "../interfaces/IAuthRepository";

export class AuthRepository implements IAuthRepository 
{
    Login(username: string, password: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    Register(username: string, password: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    Logout(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    ResetPassword(email: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    VerifyEmail(token: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}