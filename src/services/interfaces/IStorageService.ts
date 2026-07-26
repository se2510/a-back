export interface IStorageService {
  uploadFile(containerName: string, blobName: string, buffer: Buffer, mimeType: string): Promise<string>; // Create/Update
  deleteFile(containerName: string, blobName: string): Promise<void>; // Delete
  getFileUrl(containerName: string, blobName: string): Promise<string>; // Get URL (Read)
  readFile(containerName: string, blobName: string): Promise<Buffer>; // Read (contenido del archivo)
}
