export interface IGenerativeAIService {
    GenerateAsset(
        prompt: string,
        model: string,
        assetType: string,
        projectId: number,
        referenceImageId?: number
    ): Promise<{ jobId: number; assetId: number }>;
    GetStatus(jobId: number): Promise<string>;
    CancelGeneration(jobId: number): Promise<void>;
    GetLog(projectId: string): Promise<string>;
}
