export interface IAdminService 
{
    GetUsersByStatus(status: string): Promise<any[]>;
    ApproveUser(id: number): Promise<any>;
    RejectUser(id: number): Promise<any>;
    ChangeState(id: number): Promise<any>;
    GetSettings(): Promise<any>;
    UpdateSettings(): Promise<any>;
}

