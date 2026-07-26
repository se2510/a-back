import { injectable } from 'tsyringe';
import RunwayML, { RunwayMLError } from '@runwayml/sdk';
import { IVideoProvider, VideoGenerationRequest } from '../interfaces/IVideoProvider';
import { RUNWAYML_API_SECRET } from '../../config/env';
import { GenerationTask } from '../interfaces/IMediaProvider';

@injectable()
export class RunwayMLProvider implements IVideoProvider {
  private client: RunwayML;

  constructor() {
    if (!RUNWAYML_API_SECRET) {
      throw new Error(
        'RUNWAYML_API_SECRET es requerida. Por favor configura esta variable de entorno para usar RunwayML.',
      );
    }

    this.client = new RunwayML({
      apiKey: RUNWAYML_API_SECRET,
    });
  }

  async createTask(request: VideoGenerationRequest): Promise<GenerationTask> {
    if (!request.referenceImageUrl && !request.referenceImageBuffer) {
      throw new Error('Se requiere una imagen de referencia para generar video con RunwayML');
    }

    const model =
      request.model === 'gen3a_turbo' || request.model === 'gen4_turbo'
        ? request.model
        : 'gen4_turbo';

    const validRatios = [
      '1280:720',
      '720:1280',
      '1104:832',
      '832:1104',
      '960:960',
      '1584:672',
      '1280:768',
      '768:1280',
    ] as const;
    const ratio = validRatios.includes(request.ratio as any)
      ? (request.ratio as (typeof validRatios)[number])
      : '1280:720';

    const duration = request.duration === 5 || request.duration === 10 ? request.duration : 5;

    try {
      const imageToVideo = await this.client.imageToVideo.create({
        model: 'gen4_turbo',
        promptImage: request.referenceImageUrl!,
        promptText: request.prompt,
        ratio,
        duration,
      });

      return {
        id: imageToVideo.id,
        status: 'PENDING',
        result: undefined,
      };
    } catch (error) {
      if (error instanceof RunwayML.APIError) {
        throw new Error('Error al generar el video.');
      } else {
        throw new Error('Error inesperado al generar el video.');
      }
    }
  }

  async getTaskStatus(taskId: string): Promise<GenerationTask> {
    try {
      const task = await this.client.tasks.retrieve(taskId);

      return {
        id: task.id,
        status: this.mapRunwayStatus(task.status),
        result: task.output?.length
          ? {
              outputUrls: task.output,
            }
          : undefined,
        error: task.failure ? 'Fallo en la generación' : undefined,
      };
    } catch (error) {
      if (error instanceof RunwayML.APIError) {
        throw new Error(`Error al obtener el estado de la generación de video.`);
      } else {
        throw new Error('Error inesperado al obtener el estado de la generación de video.');
      }
    }
  }

  async pollTaskUntilComplete(
    taskId: string,
    maxWaitTimeMs: number = 300000,
  ): Promise<GenerationTask> {
    const startTime = Date.now();
    const pollInterval = 10000;

    while (Date.now() - startTime < maxWaitTimeMs) {
      const task = await this.getTaskStatus(taskId);

      if (['SUCCEEDED', 'FAILED'].includes(task.status)) {
        return task;
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Timeout esperando completar tarea ${taskId} después de ${maxWaitTimeMs}ms`);
  }

  private mapRunwayStatus(runwayStatus: string): 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' {
    switch (runwayStatus) {
      case 'PENDING':
        return 'PENDING';
      case 'RUNNING':
        return 'PROCESSING';
      case 'SUCCEEDED':
        return 'SUCCEEDED';
      case 'FAILED':
        return 'FAILED';
      default:
        return 'PENDING';
    }
  }
}
