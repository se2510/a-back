export interface IGenerativeAIRepository
{
    GenerateAsset(prompt: string, model: string, assetType: string): Promise<string>;    
    GetSatus(jobId: string): Promise<string>;
    CancelGeneration(jobId: string): Promise<void>;
    GetLog(projectId: string): Promise<string>; 
}
