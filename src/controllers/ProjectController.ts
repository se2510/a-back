import { Request, Response, Router } from 'express';
import { injectable, inject } from 'tsyringe';
import { IProjectService } from '../services/interfaces/IProjectService';


@injectable()
export class ProjectController 
{
  public router = Router();

  constructor(@inject('IProjectService') private svc: IProjectService) 
  {
    this.router.post('/project/create',    this.Create.bind(this));
    this.router.get('/project/getall',     this.GetAll.bind(this));
    this.router.get('/project/get/{projectId}',  this.Get.bind(this));
    this.router.put('/project/update/{projectId}',  this.Update.bind(this));
    this.router.delete('/project/delete/{projectId}',  this.Delete.bind(this));
  }

  async Create() 
  {
    throw new Error('Method not implemented.');
  }

  async GetAll() 
  {
    throw new Error('Method not implemented.');
  }

 async Get() 
  {
    throw new Error('Method not implemented.');
  }

   async Update() 
  {
    throw new Error('Method not implemented.');
  }

    async Delete() 
  {
    throw new Error('Method not implemented.');
  }
 
}
