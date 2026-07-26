import { Request, Response, Router } from 'express';
import { injectable, inject } from 'tsyringe';
import { IAdminService } from '../services/interfaces/IAdminService';
import { authUser } from '../middlewares/authUser';
import { MISSING_STATE, INVALID_USER_ID, MISSING_CONFIG } from '../constants/messages';


@injectable()
export class AdminController 
{
  public router = Router();

  constructor(@inject('IAdminService') private svc: IAdminService) 
  {
    this.router.get('/users/status', authUser, this.GetUsersByStatus.bind(this));
    this.router.post('/user/approve/:userId', authUser, this.ApproveUser.bind(this));
    this.router.post('/user/reject/:userId', authUser, this.RejectUser.bind(this));
    this.router.post('/user/changestate/:userId', authUser, this.ChangeState.bind(this));
    this.router.get('/settings', authUser, this.GetSettings.bind(this));
    this.router.put('/settings', authUser, this.UpdateSettings.bind(this));
    this.router.get('/users', authUser, this.ListUsers.bind(this));
    this.router.delete('/user/:userId', authUser, this.DeleteOrDeactivateUser.bind(this));
    this.router.get('/assets/pending', authUser, this.ListPendingAssets.bind(this));
    this.router.post('/asset/:assetId/approve', authUser, this.ApproveAsset.bind(this));
  }

  async GetUsersByStatus(req: Request, res: Response) {
    const { state } = req.query;
    if (!state || typeof state !== 'string') {
      res.status(400).json({ message: MISSING_STATE });
      return;
    }
    const users = await this.svc.GetUsersByStatus(state);
    res.json(users);
  }

  async ApproveUser(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    if (!userId) {
      res.status(400).json({ message: INVALID_USER_ID });
      return;
    }
    const user = await this.svc.ApproveUser(userId);
    res.json(user);
  }

  async RejectUser(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    if (!userId) {
      res.status(400).json({ message: INVALID_USER_ID });
      return;
    }
    const user = await this.svc.RejectUser(userId);
    res.json(user);
  }

  async ChangeState(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    if (!userId) {
      res.status(400).json({ message: INVALID_USER_ID });
      return;
    }
    const user = await this.svc.ChangeState(userId);
    res.json(user);
  }

  async GetSettings(req: Request, res: Response) {
    const config = await this.svc.GetSettings();
    res.json(config);
  }

  async UpdateSettings(req: Request, res: Response) {
    const { config } = req.body;
    if (!config) {
      res.status(400).json({ message: MISSING_CONFIG });
      return;
    }
    const updated = await this.svc.UpdateSettings(config);
    res.json(updated);
  }
 
  async ListUsers(req: Request, res: Response) {
    const users = await this.svc.ListUsers();
    res.json(users);
  }

  async DeleteOrDeactivateUser(req: Request, res: Response) {
    const id = Number(req.params.userId);
    const hardDelete = req.query.hard === 'true';
    await this.svc.DeleteOrDeactivateUser(id, hardDelete);
    res.status(204).send();
  }

  async ListPendingAssets(req: Request, res: Response) {
    const assets = await this.svc.ListPendingContent();
    res.json(assets);
  }

  async ApproveAsset(req: Request, res: Response) {
    const assetId = Number(req.params.assetId);
    const asset = await this.svc.ApproveAsset(assetId);
    res.json(asset);
  }
}
