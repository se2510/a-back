import { IAdminRepository } from "../interfaces/IAdminRepository";

export class AdminRepository implements IAdminRepository 
{
    GetSettings(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    UpdateSettings(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    GetUsersByStatus(status: string): Promise<any[]> {
        throw new Error("Method not implemented.");
    }
    ApproveUser(id: number): Promise<any> {
        throw new Error("Method not implemented.");
    }
    RejectUser(id: number): Promise<any> {
        throw new Error("Method not implemented.");
    }
    ChangeState(id: number): Promise<any> {
        throw new Error("Method not implemented.");
    }
    Settings(): Promise<any> {
        throw new Error("Method not implemented.");
    }
}