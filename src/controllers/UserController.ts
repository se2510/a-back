import { Request, Response, Router } from 'express';
import { injectable, inject } from 'tsyringe';


import { IUserService } from '../services/interfaces/IUserService';

@injectable()
export class UserController 
{
    public router = Router();

    constructor(@inject('IUserService') private svc: IUserService) 
    {
        this.router.get('/user/getall', this.GetAll.bind(this));
        this.router.get('/user/get{userId}', this.Get.bind(this));
        this.router.put('/user/update/{userId}', this.Update.bind(this));
        this.router.delete('/user/delete/{userId}', this.Delete.bind(this)); 
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
