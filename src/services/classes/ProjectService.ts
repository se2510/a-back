
import { Project } from "../../entities/Project";
import { IProjectService } from "../interfaces/IProjectService";
import { ProjectRepository } from "../../repositories/classes/ProjectRepository";
import { AppDataSource } from "../../config/container";

export class ProjectService implements IProjectService 
{

  private projectRepository = new ProjectRepository(AppDataSource);

  async DeleteProject(id: number): Promise<void>
  {
    const project = await this.projectRepository.GetProjectById(id);

    if (!project) {
      throw new Error(`Project with ID ${id} not found.`);
    }

    await this.projectRepository.DeleteProject(id);

  }

  async CreateProject(project: Partial<Project>): Promise<Project> 
  {
    return await this.projectRepository.CreateProject(project);
  }
  
  async GetProjects(): Promise<Project[]> 
  {
    return await this.projectRepository.GetProjects();
  }
  
  async GetProjectById(id: number): Promise<Project | null> 
  {
    const project = await this.projectRepository.GetProjectById(id);
    return project ? project : null;
  }
  
  async UpdateProject(id: number, project: Partial<Project>): Promise<Project> 
  {
    return this.projectRepository.UpdateProject(id, project);
  }
  async exists(id: number): Promise<boolean> {
    const project = await this.projectRepository.GetProjectById(id);
    return project !== null;
  }
  // class implementation
}