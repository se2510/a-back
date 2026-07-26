import { Request, Response, Router } from 'express';
import { injectable, inject } from 'tsyringe';
import { container } from 'tsyringe'
import { IAssetService } from '../services/interfaces/IAssetService';
import { AssetValidateParamsDto } from '../dtos/asset/AssetValidateParamsDto';
import { AssetValidateBodyDto, AssetType } from '../dtos/asset/AssetValidateBodyDto';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import { IStorageService } from '../services/interfaces/IStorageService';
import { AzureBlobStorageService } from '../services/classes/AzureBlobStorageService';
import multer from 'multer';

// Registro de IStorageService
container.registerSingleton<IStorageService>('IStorageService', AzureBlobStorageService);

// Configuración básica multer (memoria)
const upload = multer({ storage: multer.memoryStorage() });

@injectable()
export class AssetController {
  public router = Router();

  constructor(
    @inject('IAssetService') private svc: IAssetService,
  ) {
    this.router.post('/upload/:projectId', upload.single('file'), validationMiddleware(AssetValidateParamsDto, 'params'), validationMiddleware(AssetValidateBodyDto, 'body'), this.UploadAsset.bind(this));
    this.router.get('/getall/:projectId/:page', validationMiddleware(AssetValidateParamsDto, 'params'), this.GetAllAssets.bind(this));
    this.router.get('/download/:assetId', validationMiddleware(AssetValidateParamsDto, 'params'), this.DownloadAsset.bind(this));
    this.router.put('/update/:assetId', validationMiddleware(AssetValidateParamsDto, 'params'), validationMiddleware(AssetValidateBodyDto, 'body'), this.Update.bind(this));
    this.router.delete('/delete/:assetId/:confirmed', validationMiddleware(AssetValidateParamsDto, 'params'), this.DeleteAsset.bind(this));
    this.router.get('/get/:assetId', validationMiddleware(AssetValidateParamsDto, 'params'), this.GetAsset.bind(this));
  }

  async UploadAsset(req: Request, res: Response): Promise<void> {
    const { projectId } = req.params as AssetValidateParamsDto;
    let { type, metadata } = req.body as AssetValidateBodyDto;
    const file = req.file as Express.Multer.File;

    if (!type || !(Object.values(AssetType) as string[]).includes(type)) {
      res.status(400).json({ status: 'error', message: 'Tipo no válido.' });
      return;
    }

    if (!file) {
      res.status(400).json({ status: 'error', message: 'Falta el archivo para subir.' });
      return;
    }

    try {
      if (typeof metadata === 'string') {
        metadata = JSON.parse(metadata);
      } else {
        res.status(400).json({ status: 'error', message: 'El formato de metadata no es válido.' });
        return;
      }

      const asset = await this.svc.UploadAsset(
        file,
        Number(projectId),
        type,
        metadata
      );
      res.status(200).json({
        status: 'success',
        message: "Se registró en la base de datos.",
        asset
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error al registrar el asset en la base de datos.'
      });
    }
  }

  async GetAllAssets(req: Request, res: Response): Promise<void> {
    const { projectId } = req.params as AssetValidateParamsDto;
    const limit = 20; // Límite de resultados por página
    const page = req.params.page as AssetValidateParamsDto;

    try {
      // Llamar al servicio para obtener los assets paginados
      const assets = await this.svc.GetAssets(Number(projectId), Number(page), limit);

      // Calcular totalPages
      const totalPages = Math.ceil(assets.total / limit);

      // Responder con éxito
      res.status(200).json({
        status: 'success',
        data: assets.items,
        pagination: {
          total: assets.total,
          page: Number(page),
          limit: Number(limit),
          totalPages,
        },
      });
    } catch (error: any) {
      // Manejo de errores
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error interno del servidor al obtener los assets.',
      });
    }
  }

  async DownloadAsset(req: Request, res: Response): Promise<void> {
    const { assetId } = req.params as AssetValidateParamsDto;

    try {
      // Llamar al servicio para descargar el asset
      const assetUrl = await this.svc.DownloadAsset(Number(assetId));

      // Configurar encabezados para la descarga
      //res.setHeader('Content-Type', 'application/octet-stream');
      //res.setHeader('Content-Disposition', `attachment; filename="asset-${assetId}"`);

      // Enviar el archivo al cliente
      res.status(200).send({
        status: 'success',
        message: 'URL del asset obtenida correctamente.',
        data: { assetUrl }
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error interno del servidor al descargar el asset.',
      });
    }
  }

  async Update(req: Request, res: Response): Promise<void> {
    let { assetId } = req.params as AssetValidateParamsDto;
    let { metadata } = req.body as AssetValidateBodyDto;

    // Verificar si metadata es una cadena y parsearla
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch (error) {
        res.status(400).json({ status: 'error', message: 'El formato de metadata no es válido.' });
        return;
      }
    }

    try {
      const obj = { metadata }

      // Llamar al servicio para actualizar el asset
      const updatedAsset = await this.svc.UpdateAsset(Number(assetId), obj);

      // Responder con éxito
      res.status(200).json({
        status: 'success',
        message: 'El asset ha sido actualizado correctamente.',
        data: updatedAsset,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error interno del servidor al actualizar el asset.',
      });
    }
  }

  async DeleteAsset(req: Request, res: Response): Promise<void> {
    const { assetId } = req.params as AssetValidateParamsDto;
    const { confirmed } = req.params as { confirmed: string };

    // Validar el parámetro "confirmed"
    if (!confirmed || confirmed !== 'CONFIRMAR') {
      res.status(400).json({ status: 'error', message: 'Falta confirmar la eliminación.', });
      return;
    }

    try {
      // Llamar al servicio para eliminar el asset
      const result = await this.svc.DeleteAsset(Number(assetId));

      res.status(200).json({
        status: "success",
        message: "El asset ha sido eliminado correctamente",
        result
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error interno del servidor al eliminar el asset.',
      });
    }
  }

  async GetAsset(req: Request, res: Response): Promise<void> {
    const { assetId } = req.params as AssetValidateParamsDto;

    try {
      const parsedAssetId = Number(assetId); // Aún viene como string, porque no se transformó
      const asset = await this.svc.GetAssetById(parsedAssetId);

      res.status(200).json({
        status: 'success',
        message: 'Asset obtenido correctamente.',
        data: asset,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error interno del servidor al obtener el asset.',
      });
    }
  }
}