import { injectable, inject } from 'tsyringe';
import { Repository, DataSource } from 'typeorm';

import { IGenerativeAIRepository } from '../interfaces/IGenerativeAIRepository';
import { GenerationJob } from '../../entities/GenerationJob';
import { Project } from '../../entities/Project';

@injectable()
export class GenerativeAIRepository implements IGenerativeAIRepository {
    private generationJobRepository: Repository<GenerationJob>;

    constructor(@inject(DataSource) private dataSource: DataSource) {
        this.generationJobRepository =
            this.dataSource.getRepository(GenerationJob);
    }

    async GetGenerationJobById(id: number): Promise<GenerationJob | null> {
        return this.generationJobRepository.findOneBy({ id });
    }

    GetStatus(jobId: string): Promise<string> {
        throw new Error('Method not implemented.');
    }
    
    async CancelGeneration(jobId: number): Promise<void> {
        const generationJob = await this.generationJobRepository.findOneBy({ 
            id: jobId 
        });
        
        if (!generationJob) {
            throw new Error(`Trabajo de generación con ID ${jobId} no encontrado`);
        }

        if (generationJob.status === 'pending') {
            await this.generationJobRepository.update({ id: jobId }, { status: 'canceled' });
        } else {
            throw new Error(`No se puede cancelar el trabajo. Estado actual: ${generationJob.status}`);
        }
    }
    
    GetLog(projectId: string): Promise<string> {
        throw new Error('Method not implemented.');
    }

    async CreateGenerationJob(
        project: Project,
        prompt: string
    ): Promise<GenerationJob> {
        const newGenerationJob = this.generationJobRepository.create({
            project: project,
            prompt: prompt,
        });

        return this.generationJobRepository.save(newGenerationJob);
    }

    async UpdateGenerationJob(
        id: number,
        updates: Partial<GenerationJob>
    ): Promise<GenerationJob> {
        await this.generationJobRepository.update(id, updates);

        const updatedJob = await this.generationJobRepository.findOneBy({ id });
        if (!updatedJob) {
            throw new Error(`GenerationJob con ID ${id} no encontrado después de actualización`);
        }
        
        return updatedJob;
    }
}
