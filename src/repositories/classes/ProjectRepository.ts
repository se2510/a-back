import { Project } from "../../entities/Project";
import { IProjectRepository } from "../interfaces/IProjectRepository";

export class ProjectRepository implements IProjectRepository 
{
  DeleteProject(id: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
  CreateProject(project: Partial<Project>): Promise<Project> 
  {
    throw new Error("Method not implemented.");
  }
  GetProjects(): Promise<Project[]> 
  {
    throw new Error("Method not implemented.");
  }
  GetProjectById(id: number): Promise<Project | null> 
  {
    throw new Error("Method not implemented.");
  }
  UpdateProject(id: number, project: Partial<Project>): Promise<Project> 
  {
    throw new Error("Method not implemented.");
  }
  // class implementation
}