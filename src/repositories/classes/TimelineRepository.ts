import { Repository } from "typeorm";
import { injectable, inject } from "tsyringe";
import { ITimelineRepository } from "../interfaces/ITimelineRepository";
import { TimelineEvent } from "../../entities/TimelineEvent";
import { CreateTimelineEventDTO, UpdateTimelineEventDTO } from "../../dtos/Timeline";
import { Project } from "../../entities/Project";
import { Asset } from "../../entities/Asset";

@injectable() //inyección de depende
export class TimelineRepository implements ITimelineRepository {
    constructor(
        @inject("TimelineEventRepository") private timelineRepo: Repository<TimelineEvent>,
        @inject("ProjectRepository") private projectRepo: Repository<Project>,
        @inject("AssetRepository") private assetRepo: Repository<Asset>
    ) {}
    //verifica si su timeline existe
    async exists(timelineId: number): Promise<boolean> {
        const event = await this.timelineRepo.findOne({ where: { timeline_id: timelineId } });
        return !!event;
    }
    //guarda el timeline
    async saveTimeline(timelineId: number, timelineData: CreateTimelineEventDTO): Promise<void> {
        const project = await this.projectRepo.findOne({ where: { id: timelineData.project_id } });
        if (!project) {
            throw new Error("Project not found");
        }

        const asset = await this.assetRepo.findOne({ where: { id: timelineData.asset_id } });
        if (!asset) {
            throw new Error(`Asset not found: ${timelineData.asset_id}`);
        }

        const timelineEvent = this.timelineRepo.create({
            timeline_id: timelineId,
            project,
            event_type: timelineData.event_type,
            asset,
            start_time: timelineData.start_time,
            end_time: timelineData.end_time,
            properties: timelineData.properties
        });
        //guarda el timeline en la bd
        await this.timelineRepo.save(timelineEvent);
    }
    //obtiene el timeline por id
    async getById(timelineId: number): Promise<TimelineEvent | null> {
        return await this.timelineRepo.findOne({
            where: { timeline_id: timelineId },
            relations: ['project', 'asset']
        });
    }
    //obtiene el timeline por id
    async getTimeline(timelineId: number): Promise<TimelineEvent> {
        const timeline = await this.getById(timelineId);
    
        if (!timeline) {
            throw new Error(`Timeline with ID ${timelineId} not found`);
        }
    
        return timeline; 
    }

    async updateTimeline(timelineId: number, timelineData: UpdateTimelineEventDTO): Promise<TimelineEvent> {
        const timelineEvent = await this.timelineRepo.findOne({
            where: { timeline_id: timelineId },
            relations: ['project', 'asset']
        });

        if (!timelineEvent) {
            throw new Error(`Timeline event not found: ${timelineId}`);
        }

        // Update project if provided
        if (timelineData.project_id !== undefined) {
            const project = await this.projectRepo.findOne({ where: { id: timelineData.project_id } });
            if (!project) {
                throw new Error(`Project not found: ${timelineData.project_id}`);
            }
            timelineEvent.project = project;
        }

        // Update asset if provided
        if (timelineData.asset_id !== undefined) {
            const asset = await this.assetRepo.findOne({ where: { id: timelineData.asset_id } });
            if (!asset) {
                throw new Error(`Asset not found: ${timelineData.asset_id}`);
            }
            timelineEvent.asset = asset;
        }

         // Aplicar actualización eficiente
        Object.assign(timelineEvent, timelineData);

        // Guardar y devolver la entidad actualizada
        return await this.timelineRepo.save(timelineEvent);
    }
}