import { Asset } from '../../entities/Asset';
type MulterFile = Express.Multer.File;

export interface IAssetService {
    UploadAsset(file: MulterFile, projectId: number, type: 'image' | 'audio' | 'video' | 'script', metadata?: Record<string, any>): Promise<Asset>;
    GetAssets(id: number, page: number, limit: number): Promise<{ items: Asset[]; total: number }>;
    DownloadAsset(id: number): Promise<string>;
    UpdateAsset(id: number, asset: Partial<Asset>): Promise<Asset>;
    DeleteAsset(id: number): Promise<void | true>;
    GetAssetById(id: number): Promise<Asset | null>;
    exists(assetId: number): Promise<boolean>;
}
