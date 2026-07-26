import { Request, Response, Router } from 'express';
import { injectable, inject } from 'tsyringe';
import { IAssetService } from '../services/interfaces/IAssetService';
import { IAdminService } from '../services/interfaces/IAdminService';


@injectable()
export class AdminController 
{
  public router = Router();

  constructor(@inject('IAdminService') private svc: IAdminService) 
  {
    this.router.get('/admin/users/status',    this.GetUsersByStatus.bind(this));
    this.router.post('/admin/user/approve/{userId}}',     this.ApproveUser.bind(this));
    this.router.post('/admin/user/reject/{userId}',  this.RejectUser.bind(this));
    this.router.post('/admin/user/changestate/{userId}',  this.ChangeState.bind(this));
    this.router.get('/admin/get/settings',  this.GetSettings.bind(this));
    this.router.put('/admin/update/settings',  this.UpdateSettings.bind(this));
  }

  async GetUsersByStatus() 
  {
    throw new Error('Method not implemented.');
  }

  async ApproveUser() 
  {
    throw new Error('Method not implemented.');
  }

 async RejectUser() 
  {
    throw new Error('Method not implemented.');
  }

   async ChangeState() 
  {
    throw new Error('Method not implemented.');
  }
 
async GetSettings() 
  {
    throw new Error('Method not implemented.');
  }

  async UpdateSettings() 
  {
    throw new Error('Method not implemented.');
  }
 
}
