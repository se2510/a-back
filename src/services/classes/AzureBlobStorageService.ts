import { BlobServiceClient } from '@azure/storage-blob';
import { IStorageService } from '../interfaces/IStorageService';
import { container } from 'tsyringe';

// Obtenemos la configuración desde el contenedor
const azureConfig = container.resolve<any>('AZURE_BLOB_CONFIG');

const connectionString = `DefaultEndpointsProtocol=https;AccountName=${azureConfig.accountName};AccountKey=${azureConfig.accountKey};EndpointSuffix=core.windows.net`;

export class AzureBlobStorageService implements IStorageService {
  private blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

  async uploadFile(containerName: string, blobName: string, buffer: Buffer, mimeType: string): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(buffer, { blobHTTPHeaders: { blobContentType: mimeType } });
    return blockBlobClient.url;
  }

  async deleteFile(containerName: string, blobName: string): Promise<void> {
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
  }

  async getFileUrl(containerName: string, blobName: string): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return blockBlobClient.url;
  }

  async readFile(containerName: string, blobName: string): Promise<Buffer> {
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const downloadBlockBlobResponse = await blockBlobClient.download();
    const downloadedBuffer = await this.streamToBuffer(downloadBlockBlobResponse.readableStreamBody!);
    return downloadedBuffer;
  }

  private async streamToBuffer(readableStream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      readableStream.on('data', (data) => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      });
      readableStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      readableStream.on('error', reject);
    });
  }
}
