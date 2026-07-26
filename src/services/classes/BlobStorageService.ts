import {
    BlobServiceClient,
    ContainerClient,
    BlockBlobClient,
} from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { injectable } from 'tsyringe';

import { IBlobStorageService } from '../interfaces/IBlobStorageService';
import {
    AZURE_STORAGE_ACCOUNT_NAME,
    AZURE_STORAGE_CONNECTION_STRING,
} from '../../config/env';

@injectable()
export class BlobStorageService implements IBlobStorageService {
    private blobServiceClient: BlobServiceClient;

    constructor() {
        if (AZURE_STORAGE_CONNECTION_STRING) {
            this.blobServiceClient = BlobServiceClient.fromConnectionString(
                AZURE_STORAGE_CONNECTION_STRING
            );
        } else if (AZURE_STORAGE_ACCOUNT_NAME) {
            const accountUrl = `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`;
            this.blobServiceClient = new BlobServiceClient(
                accountUrl,
                new DefaultAzureCredential()
            );
        } else {
            throw new Error(
                'Configuración de Azure Blob Storage faltante. Proporciona AZURE_STORAGE_CONNECTION_STRING o AZURE_STORAGE_ACCOUNT_NAME.'
            );
        }
    }

    private getContainerClient(containerName: string): ContainerClient {
        return this.blobServiceClient.getContainerClient(containerName);
    }

    private getBlobClient(
        containerName: string,
        fileName: string
    ): BlockBlobClient {
        const containerClient = this.getContainerClient(containerName);
        return containerClient.getBlockBlobClient(fileName);
    }

    async uploadFile(
        containerName: string,
        fileName: string,
        fileBuffer: Buffer,
        contentType?: string
    ): Promise<string> {
        try {
            const blobClient = this.getBlobClient(containerName, fileName);

            const uploadOptions = {
                blobHTTPHeaders: contentType
                    ? { blobContentType: contentType }
                    : undefined,
                metadata: {
                    uploadedAt: new Date().toISOString(),
                },
            };

            await blobClient.upload(
                fileBuffer,
                fileBuffer.length,
                uploadOptions
            );
            return blobClient.url;
        } catch (error) {
            throw new Error(
                `Error al subir archivo a Azure Blob Storage: ${
                    error instanceof Error ? error.message : 'Error desconocido'
                }`
            );
        }
    }

    async getFileUrl(containerName: string, fileName: string): Promise<string> {
        try {
            const blobClient = this.getBlobClient(containerName, fileName);

            const exists = await blobClient.exists();
            if (!exists) {
                throw new Error(
                    `El archivo ${fileName} no existe en el contenedor ${containerName}`
                );
            }

            return blobClient.url;
        } catch (error) {
            throw new Error(
                `Error al obtener URL del archivo: ${
                    error instanceof Error ? error.message : 'Error desconocido'
                }`
            );
        }
    }

    async downloadFile(
        containerName: string,
        fileName: string
    ): Promise<Buffer> {
        try {
            const blobClient = this.getBlobClient(containerName, fileName);

            const downloadResponse = await blobClient.download();

            if (!downloadResponse.readableStreamBody) {
                throw new Error(`No se pudo descargar el archivo ${fileName}`);
            }

            const chunks: Buffer[] = [];

            return new Promise((resolve, reject) => {
                downloadResponse.readableStreamBody!.on('data', chunk => {
                    chunks.push(chunk);
                });

                downloadResponse.readableStreamBody!.on('end', () => {
                    resolve(Buffer.concat(chunks));
                });

                downloadResponse.readableStreamBody!.on('error', error => {
                    reject(
                        new Error(
                            `Error al descargar archivo: ${error.message}`
                        )
                    );
                });
            });
        } catch (error) {
            throw new Error(
                `Error al descargar archivo de Azure Blob Storage: ${
                    error instanceof Error ? error.message : 'Error desconocido'
                }`
            );
        }
    }

    async deleteFile(containerName: string, fileName: string): Promise<void> {
        try {
            const blobClient = this.getBlobClient(containerName, fileName);

            const deleteResponse = await blobClient.deleteIfExists();

            if (!deleteResponse.succeeded) {
                throw new Error(
                    `El archivo ${fileName} no existe en el contenedor ${containerName}`
                );
            }
        } catch (error) {
            throw new Error(
                `Error al eliminar archivo de Azure Blob Storage: ${
                    error instanceof Error ? error.message : 'Error desconocido'
                }`
            );
        }
    }

    async fileExists(
        containerName: string,
        fileName: string
    ): Promise<boolean> {
        try {
            const blobClient = this.getBlobClient(containerName, fileName);
            return await blobClient.exists();
        } catch (error) {
            throw new Error(
                `Error al verificar existencia del archivo: ${
                    error instanceof Error ? error.message : 'Error desconocido'
                }`
            );
        }
    }
}
