import { Request, Response, Router } from 'express';
import { injectable, inject } from 'tsyringe';
import { IGenerativeAIService } from '../services/interfaces/IGenerativeAIService';

@injectable()
export class GenerativeAIController 
{
  public router = Router();

  constructor(@inject('IGenerativeAIService') private svc: IGenerativeAIService) 
  {
    this.router.post('/generativeai/generate/video',    this.GenerateVideo.bind(this));
    this.router.post('/generativeai/generate/image',     this.GenerateImage.bind(this));
    this.router.post('/generativeai/generate/text',  this.GenerateText.bind(this));
    this.router.post('/generativeai/generate/audio',  this.GenerateAudio.bind(this));
    this.router.get('/generativeai/getstatus/{jobId}',  this.GetStatus.bind(this));
    this.router.post('/generativeai/cancelgeneration/{jobId}',  this.CancelGeneration.bind(this));
    this.router.get('/generativeai/getlog/{projectId}',  this.Log.bind(this));
  }

  async GenerateVideo() 
  {
    throw new Error('Method not implemented.');
  }

    async GenerateImage() 
  {
    throw new Error('Method not implemented.');
  }

  async GenerateText() 
  {
    throw new Error('Method not implemented.');
  }

 async GenerateAudio() 
  {
    throw new Error('Method not implemented.');
  }
 async GetStatus() 
  {
    throw new Error('Method not implemented.');
  }

  async CancelGeneration() 
  {
    throw new Error('Method not implemented.');
  }

  async Log() 
  {
    throw new Error('Method not implemented.');
  }
}
