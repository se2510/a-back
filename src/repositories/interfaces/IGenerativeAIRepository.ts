import { Project } from '../../entities/Project';
import { GenerationJob } from '../../entities/GenerationJob';

export interface IGenerativeAIRepository {
    CreateGenerationJob(project: Project, prompt: string): Promise<GenerationJob>;
    GetStatus(jobId: string): Promise<string>;
    CancelGeneration(jobId: number): Promise<void>;
    GetLog(projectId: string): Promise<string>;
    GetGenerationJobById(id: number): Promise<GenerationJob | null>;
    UpdateGenerationJob(id: number, updates: Partial<GenerationJob>): Promise<GenerationJob>;
}
