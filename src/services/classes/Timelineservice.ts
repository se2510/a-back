import { injectable, inject } from "tsyringe";
import { validate } from "class-validator";
import { plainToClass, plainToInstance } from "class-transformer";
import { ITimelineService } from "../interfaces/ITimelineService";
import { ITimelineRepository } from "../../repositories/interfaces/ITimelineRepository";
import { CreateTimelineEventDTO, UpdateTimelineEventDTO, TimelineEventResponseDTO } from "../../dtos/Timeline";
import { TimelineEvent } from "../../entities/TimelineEvent";
import { IProjectService } from "../interfaces/IProjectService";
import { IAssetService } from "../interfaces/IAssetService";
import { GetTimelineEventDTO } from "../../dtos/Timeline/request/GetTimelineEventDTO";

@injectable()
export class TimelineService implements ITimelineService {
    constructor(
        @inject("ITimelineRepository") private timelineRepo: ITimelineRepository,
        @inject("IProjectService") private projectService: IProjectService,
        @inject("IAssetService") private assetService: IAssetService
    ) {}

    async exists(timelineId: number): Promise<boolean> {
        return await this.timelineRepo.exists(timelineId);
    }

    async saveTimeline(timelineId: number, timelineData: CreateTimelineEventDTO): Promise<void> {
        // Validar el DTO usando class-validator
        const dto = plainToClass(CreateTimelineEventDTO, timelineData);
        const errors = await validate(dto);
        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.map(e => Object.values(e.constraints || {})).join(', ')}`);
        }

        // Validar que el proyecto existe
        const projectExists = await this.projectService.exists(timelineData.project_id);
        if (!projectExists) {
            throw new Error(`Project with ID ${timelineData.project_id} not found`);
        }
        //validar que el proyecto esté activo ####Se debe verificar con el project#######
        const project = await this.projectService.GetProjectById(timelineData.project_id);
        if (!project) {
            throw new Error(`Project with ID ${timelineData.project_id} not found`);
        }
        if (project.state === 'inactive') {
            throw new Error(`Project with ID ${timelineData.project_id} is not active`);
        }


        // Validar que el asset existe
        const assetExists = await this.assetService.exists(timelineData.asset_id);
        if (!assetExists) {
            throw new Error(`Asset with ID ${timelineData.asset_id} not found`);
        }
        //verificar que el asset esté activo ####Se debe verificar con el asset#######
        const asset = await this.assetService.GetAssetById(timelineData.asset_id);
        if (!asset) {
            throw new Error(`Asset with ID ${timelineData.asset_id} not found`);
        }
        if (asset.moderation_status !== 'approved') {
            throw new Error(`Asset with ID ${timelineData.asset_id} is not active`);
        }
        // Validar tiempos
        if (timelineData.start_time >= timelineData.end_time) {
            throw new Error('Start time must be less than end time');
        }
        //Guarda
        await this.timelineRepo.saveTimeline(timelineId, dto);
    }


    async getTimeline(timelineId: number): Promise<TimelineEventResponseDTO> {
        // Obtener la entidad desde el repositorio
        const timeline = await this.timelineRepo.getTimeline(timelineId);

        // Verificar que se haya obtenido la entidad correctamente
        if (!timeline) {
            throw new Error(`Timeline with ID ${timelineId} not found`);
        }

        // Convertir la entidad en una instancia del DTO de respuesta
        return plainToInstance(TimelineEventResponseDTO, timeline);
    }


    async updateTimeline(timelineId: number, timelineData: UpdateTimelineEventDTO): Promise<TimelineEventResponseDTO> {
        // Validar el DTO
        const dto = plainToClass(UpdateTimelineEventDTO, { ...timelineData, timeline_id: timelineId });
        const errors = await validate(dto);
        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.map(e => Object.values(e.constraints || {})).join(', ')}`);
        }
    
        // Verificar existencia del timeline
        const timelineExists = await this.exists(timelineId);
        if (!timelineExists) {
            throw new Error(`Timeline with ID ${timelineId} not found`);
        }
    
        // Validar existencia y estado activo del proyecto
        if (dto.project_id !== undefined) {
            const project = await this.projectService.GetProjectById(dto.project_id);
            if (!project || project.state === 'inactive') {
                throw new Error(`Project with ID ${dto.project_id} is not active`);
            }
        }
    
        // Validar existencia y estado activo del asset
        if (dto.asset_id !== undefined) {
            const asset = await this.assetService.GetAssetById(dto.asset_id);
            if (!asset || asset.moderation_status !== 'approved') {
                throw new Error(`Asset with ID ${dto.asset_id} is not active`);
            }
        }
    
        // Validar tiempos si se están actualizando
        if (dto.start_time !== undefined && dto.end_time !== undefined) {
            if (dto.start_time >= dto.end_time) {
                throw new Error('Start time must be less than end time');
            }
        }
    
        // Actualizar el Timeline
        const updatedTimeline = await this.timelineRepo.updateTimeline(timelineId, dto);
        if (!updatedTimeline) {
            throw new Error(`Failed to update TimelineEvent with ID ${timelineId}`);
        }
    
        // Obtener el Timeline actualizado
        const timelineEvent = await this.timelineRepo.getTimeline(timelineId);
        if (!timelineEvent) {
            throw new Error(`TimelineEvent with ID ${timelineId} not found after update`);
        }
    
        // Retornar la respuesta con el DTO
        return plainToInstance(TimelineEventResponseDTO, timelineEvent);
    }

    
} 