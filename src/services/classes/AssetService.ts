import { Asset } from "../../entities/Asset";
import { IAssetService } from "../interfaces/IAssetService";

export class AssetService implements IAssetService 
{
    UploadAsset(file: Express.Multer.File): Promise<Asset> 
    {
        throw new Error("Method not implemented.");
    }
    GetAssets(): Promise<Asset[]> 
    {
        throw new Error("Method not implemented.");
    }
    DownloadAsset(id: number): Promise<Buffer> 
    {
        throw new Error("Method not implemented.");
    }
    UpdateAsset(id: number, asset: Partial<Asset>): Promise<Asset> 
    {
        throw new Error("Method not implemented.");
    }
    DeleteAsset(id: number): Promise<void> 
    {
        throw new Error("Method not implemented.");
    }
    GetAssetById(id: number): Promise<Asset | null> 
    {
        throw new Error("Method not implemented.");
    }
}