import { IAdminService } from "../interfaces/IAdminService";

export class AdminService implements IAdminService 
{
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
    GetSettings(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    UpdateSettings(): Promise<any> {
        throw new Error("Method not implemented.");
    }
}