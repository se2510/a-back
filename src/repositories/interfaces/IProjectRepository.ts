import { Project } from '../../entities/Project';

export interface IProjectRepository 
{
  CreateProject(project: Partial<Project>): Promise<Project>;
  GetProjects(): Promise<Project[]>;
  GetProjectById(id: number): Promise<Project | null>;
  UpdateProject(id: number, project: Partial<Project>): Promise<Project>;
  DeleteProject(id: number): Promise<void>;
}
