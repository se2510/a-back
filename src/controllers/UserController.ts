import {Request, Response, Router} from 'express';
import {inject, injectable} from 'tsyringe';
import {IUserService} from '../services/interfaces/IUserService';

@injectable()
export class UserController {
    public router = Router();

    constructor(@inject('IUserService') private svc: IUserService) {
        this.router.get('', this.GetAll.bind(this) as any);
        this.router.get('/:userId', this.Get.bind(this) as any);
        this.router.post('', this.Create.bind(this) as any);
        this.router.put('/:userId', this.Update.bind(this) as any);
        this.router.delete('/:userId', this.Delete.bind(this) as any);
    }

    async GetAll(req: Request, res: Response) {
        const users = await this.svc.GetUsers();
        res.json(users);
    }

    async Get(req: Request, res: Response) {
        const id = Number(req.params.userId);
        const user = await this.svc.GetUserById(id);
        if (!user) return res.status(404).json({message: 'User not found'});
        res.json(user);
    }

    async Create(req: Request, res: Response) {
        const user = await this.svc.createUser(req.body);
        res.status(201).json(user);
    }

    async Update(req: Request, res: Response) {
        const id = Number(req.params.userId);
        const user = await this.svc.UpdateUser(id, req.body);
        res.json(user);
    }

    async Delete(req: Request, res: Response) {
        const id = Number(req.params.userId);
        await this.svc.DeleteUser(id);
        res.status(204).send();
    }
}
