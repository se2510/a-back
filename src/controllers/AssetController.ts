import { Request, Response, Router } from 'express';
import { injectable, inject } from 'tsyringe';
import { IAssetService } from '../services/interfaces/IAssetService';


@injectable()
export class AssetController 
{
  public router = Router();

  constructor(@inject('IAssetService') private svc: IAssetService) 
  {
    this.router.post('/asset/upload/{projectId}',    this.UploadAsset.bind(this));
    this.router.get('/asset/getall/{projectId}',     this.GetAllAssets.bind(this));
    this.router.get('/asset/download/{assetId}',  this.DownloadAsset.bind(this));
    this.router.put('/asset/update/{assetId}',  this.Update.bind(this));
    this.router.delete('/asset/delete/{assetId}',  this.DeleteAsset.bind(this));
    this.router.get('/asset/get/{assetId}',  this.GetAsset.bind(this));
  }

  async UploadAsset() 
  {
    throw new Error('Method not implemented.');
  }

  async GetAllAssets() 
  {
    throw new Error('Method not implemented.');
  }

 async DownloadAsset() 
  {
    throw new Error('Method not implemented.');
  }

   async Update() 
  {
    throw new Error('Method not implemented.');
  }

    async DeleteAsset() 
  {
    throw new Error('Method not implemented.');
  }
 
async GetAsset() 
  {
    throw new Error('Method not implemented.');
  }
 
}
