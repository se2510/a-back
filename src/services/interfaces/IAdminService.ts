export interface IAdminService 
{
    GetUsersByStatus(status: string): Promise<any[]>;
    ApproveUser(id: number): Promise<any>;
    RejectUser(id: number): Promise<any>;
    ChangeState(id: number): Promise<any>;
    GetSettings(): Promise<any>;
    UpdateSettings(config: any): Promise<any>;
    ListUsers(): Promise<any[]>;
    DeleteOrDeactivateUser(id: number, hardDelete?: boolean): Promise<void>;
    ListPendingContent(): Promise<any>;
    ApproveAsset(assetId: number): Promise<any>;
}
