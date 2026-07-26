import { Repository } from 'typeorm';
import { Asset } from '../../entities/Asset';
import { IAssetRepository } from '../interfaces/IAssetRepository';
import { AppDataSource } from '../../config/container'; // Configuración de TypeORM
import { Project } from '../../entities/Project';

export class AssetRepository implements IAssetRepository {
  private repository: Repository<Asset>;

  constructor() {
    this.repository = AppDataSource.getRepository(Asset);
  }

  // add moderationStatus parameter as default 'pending'
  async UploadAsset(
    projectId: number,
    type: 'image' | 'audio' | 'video' | 'script',
    filePath: string,
    metadata?: Record<string, any>,
    moderationStatus?: 'pending' | 'approved' | 'rejected',
  ): Promise<Asset> {
    const asset = this.repository.create({
      project: { id: projectId }, // Relación con el proyecto
      type,
      filePath,
      metadata,
      moderation_status: moderationStatus || 'pending',
    });

    const registerDB = await this.repository.save(asset);

    if (!registerDB) {
      throw new Error('Error al guardar el asset en la base de datos.');
    }

    return registerDB;
  }

  async GetAssets(
    projectId: number,
    page: number,
    limit: number,
  ): Promise<{ items: Asset[]; total: number }> {
    const [items, total] = await this.repository.findAndCount({
      where: { project: { id: projectId } },
      skip: (page - 1) * limit,
      take: limit,
    });

    if (!items || items.length === 0) {
      throw new Error(`No se encontraron assets para el proyecto.`);
    }
    return { items, total };
  }

  async DownloadAsset(id: number): Promise<string> {
    const asset = await this.repository.findOne({ where: { id } });
    if (!asset) {
      throw new Error(`Ruta de archivi no encontrada.`);
    }
    return asset.filePath;
  }

  async UpdateAsset(id: number, asset: Partial<Asset>): Promise<Asset> {
    await this.repository.update(id, asset);

    const updatedAsset = await this.repository.findOneBy({ id });
    if (!updatedAsset) {
      throw new Error(`Asset con ID ${id} no encontrado después de actualización`);
    }

    return updatedAsset;
  }

  async DeleteAsset(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async GetAssetById(id: number): Promise<Asset | null> {
    let assets = await this.repository.findOne({ where: { id } });

    if (!assets) {
      throw new Error(`Asset no encontrado.`);
    }
    return assets;
  }
}

  
