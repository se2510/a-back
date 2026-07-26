import { BlobServiceClient } from '@azure/storage-blob';
import { container } from 'tsyringe';

const azureConfig = container.resolve<any>('AZURE_BLOB_CONFIG');

// Construimos la cadena de conexión real para Azure Blob Storage
const connectionString = `DefaultEndpointsProtocol=https;AccountName=${azureConfig.accountName};AccountKey=${azureConfig.accountKey};EndpointSuffix=core.windows.net`;

export const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
