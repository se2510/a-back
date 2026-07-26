import { Asset } from '../../entities/Asset';

export interface IAssetRepository {
  UploadAsset(
    projectId: number,
    type: 'image' | 'audio' | 'video' | 'script',
    filePath: string,
    metadata?: Record<string, any>,
    moderationStatus?: 'pending' | 'approved' | 'rejected',
  ): Promise<Asset>;
  GetAssets(id: number, page: number, limit: number): Promise<{ items: Asset[]; total: number }>;
  DownloadAsset(id: number): Promise<string>;
  UpdateAsset(id: number, asset: Partial<Asset>): Promise<Asset>;
  DeleteAsset(id: number): Promise<void>;
  GetAssetById(id: number): Promise<Asset | null>;
}
