import { Asset } from '../../entities/Asset';
type MulterFile = Express.Multer.File;

export interface IAssetService 
{
    UploadAsset(file: MulterFile): Promise<Asset>;
    GetAssets(): Promise<Asset[]>;
    DownloadAsset(id: number): Promise<Buffer>;
    UpdateAsset(id: number, asset: Partial<Asset>): Promise<Asset>;
    DeleteAsset(id: number): Promise<void>;
    GetAssetById(id: number): Promise<Asset | null>;
}
