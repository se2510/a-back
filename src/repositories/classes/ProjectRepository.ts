import { injectable, inject } from 'tsyringe';
import { DataSource, Repository } from 'typeorm';
import { Project } from '../../entities/Project';
import { IProjectRepository } from '../interfaces/IProjectRepository';

@injectable()
export class ProjectRepository implements IProjectRepository {
    private projectRepository: Repository<Project>;

    constructor(@inject(DataSource) private dataSource: DataSource) {
        this.projectRepository = this.dataSource.getRepository(Project);
    }

    DeleteProject(id: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
    CreateProject(project: Partial<Project>): Promise<Project> {
        throw new Error('Method not implemented.');
    }
    GetProjects(): Promise<Project[]> {
        throw new Error('Method not implemented.');
    }

    async GetProjectById(id: number): Promise<Project | null> {
        return this.projectRepository.findOneBy({ id });
    }

    UpdateProject(id: number, project: Partial<Project>): Promise<Project> {
        throw new Error('Method not implemented.');
    }

    async findById(id: number): Promise<Project | null> {
        return this.GetProjectById(id);
    }
}