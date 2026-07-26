
import { Request, Response, Router } from 'express';
import { injectable, inject } from 'tsyringe';
import { IProjectService } from '../services/interfaces/IProjectService';

import { validationMiddleware } from '../middlewares/validationMiddleware';

import { CreateProjectDto } from '../dtos/projects/CreateProjectDto';
import { ProjectIDParamDto } from '../dtos/projects/ProjectIdParamDto';

@injectable()
export class ProjectController 
{
  public router = Router();

  constructor(@inject('IProjectService') private svc: IProjectService) 
  {
    
    this.router.post(
      '/create',
      validationMiddleware(CreateProjectDto),    
      this.Create.bind(this)
    );

    this.router.get('/getall', this.GetAll.bind(this));

    this.router.get(
      '/get/:projectId',
      validationMiddleware(ProjectIDParamDto, 'params'),
      this.Get.bind(this)
    );
    
    this.router.put(
      '/update/:projectId',
      validationMiddleware(ProjectIDParamDto, 'params'),
      this.Update.bind(this)
    );
    
    
    this.router.delete(
      '/delete/:projectId',
      validationMiddleware(ProjectIDParamDto, 'params'),
      this.Delete.bind(this)
    );

  }

  async Create(req: Request, res: Response)
  {
    
    try{

      const projectData: CreateProjectDto = req.body;
      const createdProject = await this.svc.CreateProject(projectData);
      res.status(201).json(createdProject);

    }catch(error){
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }

  }

  async GetAll(req: Request, res: Response) 
  {
    
    try{

      const projects = await this.svc.GetProjects();

      const filteredProjects = projects.map(project => ({
        name: project.name,
        description: project.description,
        createdAt: project.createdAt,
      }));

      res.status(200).json(filteredProjects);

    }catch (error){
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }

  }

  async Get(req: Request, res: Response) 
  {
    
    try{

      const { projectId } = req.params;
      const project = await this.svc.GetProjectById(Number(projectId));

      if (!project) {
        res.status(404).json({ message: 'Proyecto no encontrado' });
        return;
      }

      res.status(200).json(project);

    }catch (error) {
      if (error instanceof Error) {
        res.status(500).json({
          error: 'Error interno del servidor al obtener el proyecto',
          details: error.message,
        });
      }
    }

  }

  async Update(req: Request, res: Response) 
  {
    
    try {

      const { projectId } = req.params;
      const projectData = req.body;
      
      const updatedProject = await this.svc.UpdateProject(
        Number(projectId),
        projectData
      );

      if (!updatedProject) {
        res.status(404).json({ message: 'Proyecto no encontrado' });
        return;
      }

      res.status(200).json(updatedProject);

    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({
          error: 'Error interno del servidor al actualizar el proyecto',
          details: error.message,
        });
      }
    }

  }

  async Delete(req: Request, res: Response) 
  {
    
    try{

      const { projectId } = req.params;
      await this.svc.DeleteProject(Number(projectId));
      res.status(200).json({
        message: 'Proyecto eliminado correctamente',
      });

    }catch (error) {
      if (error instanceof Error) {
        res.status(500).json({
          error: 'Error interno del servidor al eliminar el proyecto',
          details: error.message,
        });
      }
    }

  }
 
}