import { inject, injectable } from "tsyringe";
import { Asset } from "../../entities/Asset";
import { IAssetService } from "../interfaces/IAssetService";
import { IAssetRepository } from "../../repositories/interfaces/IAssetRepository";
import { IStorageService } from "../interfaces/IStorageService";
import { isValidExtensionForType } from "../../utils/asset/AssetValidatePath";
type MulterFile = Express.Multer.File;
import { config } from "dotenv";
config(); // Cargar las variables de entorno desde el archivo .env

const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "assets"; // Leer el nombre del contenedor desde .env



@injectable()
export class AssetService implements IAssetService {
    constructor(
        @inject("IAssetRepository") private assetRepository: IAssetRepository,
        @inject("IStorageService") private storageService: IStorageService
    ) { }

    async UploadAsset(file: MulterFile, projectId: number, type: 'image' | 'audio' | 'video' | 'script', metadata: Record<string, any>): Promise<Asset> {
        // === Extraer extensión del archivo una sola vez ===
        const fileExtensionMatch = file.originalname.toLowerCase().match(/\.[a-z0-9]+$/);
        const fileExtension = fileExtensionMatch ? fileExtensionMatch[0] : '';

        if (!isValidExtensionForType(type, fileExtension)) {
            throw new Error('La extensión del archivo no coincide con el tipo declarado.');
        }

        // === Extraer datos útiles del archivo y agregarlos a metadata ===
        const enrichedMetadata = {
            ...metadata,
            fileExtension,
            fileSize: file.size,              // tamaño en bytes
            mimeType: file.mimetype,
            originalName: file.originalname
        };

        // === Subida a Azure Blob Storage ===
        const blobName = `${type}-${Date.now()}${fileExtension}`;
        const fileUrl = await this.storageService.uploadFile(
            containerName,
            blobName,
            file.buffer,
            file.mimetype
        );
        if (!fileUrl) {
            throw new Error('No se obtuvo una URL del archivo subido.');
        }

        // === Registro en la base de datos ===
        const asset = await this.assetRepository.UploadAsset(
            projectId,
            type,
            fileUrl,
            enrichedMetadata,
            'approved'
        );
        if (!asset) {
            throw new Error('No se guardó el registro en la base de datos');
        }

        return asset;
    }

    async GetAssets(projectId: number, page: number, limit: number): Promise<{ items: Asset[]; total: number }> {
        // Llamar al repositorio para obtener los assets paginados
        const assets = await this.assetRepository.GetAssets(projectId, page, limit);
        if (!assets || !assets.items || assets.items.length === 0) {
            throw new Error(`No se encontraron assets para el proyecto con ID ${projectId}.`);
        }
        return assets;
    }

    async DownloadAsset(id: number): Promise<string> {
        /*
        // Validar la existencia del asset y obtener el filePath
        const filePath = await this.assetRepository.DownloadAsset(id);

        // Extraer el nombre del blob del filePath
        const blobName = filePath.split('/').pop(); // Extraer el nombre del blob
        if (!blobName) {
            throw new Error(`No se pudo extraer el nombre del blob del filePath: ${filePath}`);
        }

        // Descargar el archivo desde Azure Blob Storage
        const fileBuffer = await this.storageService.readFile(containerName, blobName);
        if (!fileBuffer) {
            throw new Error(`No se pudo descargar el archivo con nombre: ${blobName}`);
        }
        return fileBuffer;
        */

        const asset = await this.assetRepository.GetAssetById(id);
        if (!asset) {
            throw new Error(`Asset no encontrado.`);
        }

        return asset.filePath;
    }

    async UpdateAsset(id: number, asset: Partial<Asset>): Promise<Asset> {
        // Verificar si el asset existe
        const existingAsset = await this.assetRepository.GetAssetById(id);
        if (!existingAsset) {
            throw new Error(`Asset no encontrado.`);
        }

        // Asegurarse de que metadata sea un objeto JSON
        let metadata = asset.metadata;
        if (typeof metadata !== 'object' || metadata === null) {
            throw new Error('El formato de metadata debe ser un objeto JSON válido.');
        }

        // Actualizar los campos necesarios
        const updatedFields = { metadata };

        // Llamar al repositorio para actualizar el asset
        const updatedAsset = await this.assetRepository.UpdateAsset(id, updatedFields);

        if (!updatedAsset) {
            throw new Error(`No se pudo actualizar el asset.`);
        }
        // Retornar el asset actualizado
        return updatedAsset;
    }

    async DeleteAsset(id: number): Promise<void | true> {
        // Verificar si el asset existe
        const asset = await this.assetRepository.GetAssetById(id);
        if (!asset) {
            throw new Error(`Asset con ID ${id} no encontrado.`);
        }

        // Borrar el registro en la base de datos
        await this.assetRepository.DeleteAsset(id);

        // Borrar el archivo del blob storage
        const blobName = asset.filePath.split('/').pop(); // Extraer el nombre del blob del filePath
        if (blobName) {
            await this.storageService.deleteFile(containerName, blobName);
        } else {
            console.warn(`No se pudo extraer el nombre del blob del filePath`);
        }

        // Devolver una respuesta de éxito
        return true;
    }

    async GetAssetById(id: number): Promise<Asset | null> {
        // Verificar si el asset existe
        const asset = await this.assetRepository.GetAssetById(id);
        if (!asset) {
            throw new Error(`Asset no encontrado.`);
        }

        // Devolver la información del asset
        return asset;
    }
}