import { IGenerativeAIService } from "../interfaces/IGenerativeAIService";

export class GenerativeAIService implements IGenerativeAIService 
{
    GetSatus(jobId: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    CancelGeneration(jobId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    GetLog(projectId: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    GenerateAsset(prompt: string, model: string, assetType: string): Promise<string> 
    {
        throw new Error("Method not implemented.");
    }
}