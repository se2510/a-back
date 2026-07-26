import { injectable, inject } from 'tsyringe';

import { IGenerativeAIService } from '../interfaces/IGenerativeAIService';
import { IGenerativeAIRepository } from '../../repositories/interfaces/IGenerativeAIRepository';
import { IProjectRepository } from '../../repositories/interfaces/IProjectRepository';
import { IAssetRepository } from '../../repositories/interfaces/IAssetRepository';
import { IBlobStorageService } from '../interfaces/IBlobStorageService';
import { AZURE_STORAGE_CONTAINER_NAME } from '../../config/env';
import { Project } from '../../entities/Project';
import { VideoGenerationRequest } from '../../providers/interfaces/IVideoProvider';
import { IMediaProvider } from '../../providers/interfaces/IMediaProvider';
import { IMediaProviderRegistry } from '../../providers/interfaces/IMediaProviderRegistry';

interface AssetData {
  buffer: Buffer;
  url: string;
}

@injectable()
export class GenerativeAIService implements IGenerativeAIService {
  private static readonly VIDEO_RESOLUTION = '1280:720';
  private static readonly VIDEO_DURATION = 5;

  constructor(
    @inject('IGenerativeAIRepository')
    private generativeAIRepository: IGenerativeAIRepository,
    @inject('IProjectRepository')
    private projectRepository: IProjectRepository,
    @inject('IAssetRepository')
    private assetRepository: IAssetRepository,
    @inject('IBlobStorageService')
    private blobStorageService: IBlobStorageService,
    @inject('IMediaProviderRegistry')
    private mediaProviderRegistry: IMediaProviderRegistry,
  ) {}

  async GetStatus(jobId: number): Promise<string> {
    const generationJob = await this.generativeAIRepository.GetGenerationJobById(jobId);
    if (!generationJob) {
      throw new Error(`Generación con ID ${jobId} no encontrada`);
    }
    return generationJob.status;
  }

  async CancelGeneration(jobId: number): Promise<void> {
    await this.generativeAIRepository.CancelGeneration(jobId);
  }

  GetLog(projectId: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async GenerateAsset(
    prompt: string,
    model: string,
    assetType: 'image' | 'audio' | 'video' | 'script',
    projectId: number,
    referenceImageId?: number,
  ): Promise<{jobId: number; assetId: number}> {
    const project = await this.getAndValidateProject(projectId);

    const [generationJob, asset] = await Promise.all([
      this.generativeAIRepository.CreateGenerationJob(project, prompt),
      this.assetRepository.UploadAsset(project.id, assetType, 'pending'),
    ]);

    if (assetType.toLowerCase() === 'video') {
      this.generateVideo(generationJob.id, asset.id, prompt, model, referenceImageId);
    }

    return {jobId: generationJob.id, assetId: asset.id};
  }

  private async getAndValidateProject(projectId: number): Promise<Project> {
    const project = await this.projectRepository.GetProjectById(projectId);
    if (!project) throw new Error(`Proyecto con ID ${projectId} no encontrado`);

    if (project.state !== 'active')
      throw new Error(`El proyecto con ID ${projectId} no está activo`);

    return project;
  }

  private async generateVideo(
    jobId: number,
    assetId: number,
    prompt: string,
    model: string,
    referenceImageId?: number,
  ): Promise<void> {
    try {
      const provider = this.mediaProviderRegistry.getVideoProvider(model);

      let refUrl: string | undefined;
      let refBuffer: Buffer | undefined;

      if (referenceImageId !== undefined) {
        const refAsset = await this.getReferenceImage(referenceImageId);
        refUrl = refAsset.url;
        refBuffer = refAsset.buffer;
      }

      const videoRequest: VideoGenerationRequest = {
        prompt,
        model,
        referenceImageUrl: refUrl,
        referenceImageBuffer: refBuffer,
        ratio: GenerativeAIService.VIDEO_RESOLUTION,
        duration: GenerativeAIService.VIDEO_DURATION,
      };

      await this.generativeAIRepository.UpdateGenerationJob(jobId, { status: 'running' });

      const { id: taskId } = await provider.createTask(videoRequest);
      await this.pollVideoGenerationTask(jobId, assetId, taskId, provider);
    } catch (error) {
      await Promise.all([
        this.generativeAIRepository.UpdateGenerationJob(jobId, { status: 'error' }),
        this.assetRepository.UpdateAsset(assetId, {
          moderation_status: 'rejected',
        }),
      ]);

      console.error(error);
    }
  }

  private async getReferenceImage(referenceImageId: number): Promise<AssetData> {
    const asset = await this.assetRepository.GetAssetById(referenceImageId);
    if (!asset) {
      throw new Error(`Imagen de referencia con ID ${referenceImageId} no encontrada`);
    }

    const fileName = this.extractFileName(asset.filePath);
    const container = AZURE_STORAGE_CONTAINER_NAME;

    const exists = await this.blobStorageService.fileExists(container, fileName);
    if (!exists) throw new Error(`Archivo ${fileName} no existe en Azure Blob Storage`);

    const [url, buffer] = await Promise.all([
      this.blobStorageService.getFileUrl(container, fileName),
      this.blobStorageService.downloadFile(container, fileName),
    ]);

    return { url, buffer };
  }

  private extractFileName(filePath: string): string {
    return filePath.split(/[\/\\]/).pop()!;
  }

  private async pollVideoGenerationTask(
    jobId: number,
    assetId: number,
    externalTaskId: string,
    videoProvider: IMediaProvider,
  ): Promise<void> {
    setImmediate(async () => {
      try {
        const task = await videoProvider.pollTaskUntilComplete(externalTaskId);

        if (task.status === 'SUCCEEDED') {
          const videoUrl = task.result?.outputUrls?.[0]!;

          const { blobUrl } = await this.downloadAndUploadVideoToBlobStorage(videoUrl, jobId);

          await Promise.all([
            this.generativeAIRepository.UpdateGenerationJob(jobId, {
              status: 'done',
              resultUrl: blobUrl,
            }),
            this.assetRepository.UpdateAsset(assetId, {
              moderation_status: 'approved',
              filePath: blobUrl,
            }),
          ]);
        } else if (task.status === 'FAILED') {
          throw new Error('Error al generar el video.');
        }
      } catch (error) {
        await Promise.all([
          this.generativeAIRepository.UpdateGenerationJob(jobId, { status: 'error' }),
          this.assetRepository.UpdateAsset(assetId, {
            moderation_status: 'rejected',
          }),
        ]);

        console.error(error);
      }
    });
  }

  private async downloadAndUploadVideoToBlobStorage(
    videoUrl: string,
    jobId: number,
  ): Promise<{ blobUrl: string; fileName: string }> {
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Error al descargar video: ${response.status} ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `video-${jobId}-${timestamp}.mp4`;

    const blobUrl = await this.blobStorageService.uploadFile(
      AZURE_STORAGE_CONTAINER_NAME,
      fileName,
      buffer,
      'video/mp4',
    );

    return { blobUrl, fileName };
  }
}
