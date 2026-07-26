export interface IBlobStorageService {
    uploadFile(containerName: string, fileName: string, fileBuffer: Buffer, contentType?: string): Promise<string>;
    getFileUrl(containerName: string, fileName: string): Promise<string>;
    downloadFile(containerName: string, fileName: string): Promise<Buffer>;
    deleteFile(containerName: string, fileName: string): Promise<void>;
    fileExists(containerName: string, fileName: string): Promise<boolean>;
} 