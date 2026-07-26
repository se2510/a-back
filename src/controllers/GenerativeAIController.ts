import { NextFunction, Response, Router } from 'express';

import { injectable, inject } from 'tsyringe';

import { IGenerativeAIService } from '../services/interfaces/IGenerativeAIService';
import { GenerateVideoDTO } from '../dtos/generative-ai/GenerateVideoDTO';
import { GenerateVideoResponseDTO } from '../dtos/generative-ai/GenerateVideoResponseDTO';
import { GenerateAudioDTO } from '../dtos/generative-ai/GenerateAudioDTO';
import { GenerateAudioResponseDTO } from '../dtos/generative-ai/GenerateAudioResponseDTO';
import { GetStatusDTO } from '../dtos/generative-ai/GetStatusDTO';
import { GetStatusResponseDTO } from '../dtos/generative-ai/GetStatusResponseDTO';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { TypedRequestBody, TypedRequestParams } from '../types/requests';
import { GenerateImageDTO } from '../dtos/generative-ai/GenerateImageDTO';
import { GenerateImageResponseDTO } from '../dtos/generative-ai/GenerateImageResponseDTO';
import { GenerateTextDTO } from '../dtos/generative-ai/GenerateTextDTO';
import { GenerateTextResponseDTO } from '../dtos/generative-ai/GenerateTextResponseDTO';
import { CancelGenerationDTO } from '../dtos/generative-ai/CancelGenerationDTO';

@injectable()
export class GenerativeAIController {
    public router = Router();

    constructor(
        @inject('IGenerativeAIService') private svc: IGenerativeAIService
    ) {
        this.router.post(
            '/generate/video',
            validationMiddleware(GenerateVideoDTO, 'body'),
            this.GenerateVideo.bind(this)
        );
        this.router.post(
            '/generate/image',
            validationMiddleware(GenerateImageDTO, 'body'),
            this.GenerateImage.bind(this)
        );
        this.router.post(
            '/generate/text', 
            validationMiddleware(GenerateTextDTO, 'body'), 
            this.GenerateText.bind(this)
        );
        this.router.post(
            '/generate/audio',
            validationMiddleware(GenerateAudioDTO, 'body'),
            this.GenerateAudio.bind(this)
        );
        this.router.get(
            '/getstatus/:jobId',
            validationMiddleware(GetStatusDTO, 'params'),
            this.GetStatus.bind(this)
        );
        this.router.post(
            '/cancelgeneration/:jobId',
            validationMiddleware(CancelGenerationDTO, 'params'),
            this.CancelGeneration.bind(this)
        );
        this.router.get('/getlog/{projectId}', this.Log.bind(this));
    }

    async GenerateVideo(
        req: TypedRequestBody<GenerateVideoDTO>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
      try {
        const { projectId, prompt, model, referenceImageId } = req.validatedBody!;

        const {jobId, assetId} = await this.svc.GenerateAsset(
          prompt,
          model,
          'video',
          projectId,
          referenceImageId
        );

        const response = new GenerateVideoResponseDTO(jobId, assetId);
        
        res.status(201).json(response);
      
    } catch (error) {
        next(error);        
      }
    }

    async GenerateImage(req: TypedRequestBody<GenerateImageDTO>, res: Response): Promise<void> {
        const { projectId, prompt, model } = req.validatedBody!;

        const {jobId, assetId} = await this.svc.GenerateAsset(
            prompt,
            model,
            'image',
            projectId,
        );

        const response = new GenerateImageResponseDTO(jobId, assetId);
        res.status(201).json(response);
    }

    async GenerateText(req: TypedRequestBody<GenerateTextDTO>, res: Response): Promise<void> {
        const { projectId, prompt, model } = req.validatedBody!;

        const {jobId, assetId} = await this.svc.GenerateAsset(
            prompt,
            model,
            'text',
            projectId
        );

        const response = new GenerateTextResponseDTO(jobId);
        res.status(201).json(response);
    }

    async GenerateAudio(req: TypedRequestBody<GenerateAudioDTO>, res: Response): Promise<void> {
        const { projectId, prompt, model } = req.validatedBody!;

        const {jobId, assetId} = await this.svc.GenerateAsset(
            prompt,
            model,
            'audio',
            projectId
        );

        const response = new GenerateAudioResponseDTO(jobId);
        res.status(201).json(response);
    }

    async GetStatus(
        req: TypedRequestParams<GetStatusDTO>, 
        res: Response, 
        next: NextFunction
    ): Promise<void> {
      try {
        const { jobId } = req.validatedParams!;

        const status = await this.svc.GetStatus(jobId);

        const response = new GetStatusResponseDTO(status);
        res.status(200).json(response);
      } catch (error) {
        next(error);
      }
    }

    async CancelGeneration(req: TypedRequestParams<CancelGenerationDTO>, res: Response): Promise<void> {
        const { jobId } = req.validatedParams!;

        await this.svc.CancelGeneration(jobId);
        
        res.status(204).send();
    }

    async Log() {
        throw new Error('Method not implemented.');
    }
}
