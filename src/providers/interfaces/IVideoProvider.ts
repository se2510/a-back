import { IMediaProvider, GenerationRequest } from '../../providers/interfaces/IMediaProvider';

export interface VideoGenerationRequest extends GenerationRequest {
  model?: string;
  referenceImageUrl?: string;
  referenceImageBuffer?: Buffer;
  ratio?: string;
  duration?: number;
}

export interface IVideoProvider extends IMediaProvider {}
