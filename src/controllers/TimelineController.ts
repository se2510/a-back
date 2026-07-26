import { Request, Response, Router, RequestHandler } from 'express';
import { injectable, inject } from 'tsyringe';
import { plainToInstance, instanceToPlain } from 'class-transformer';
import { validate } from 'class-validator';
import { ITimelineService } from '../services/interfaces/ITimelineService';
import { CreateTimelineEventDTO, UpdateTimelineEventDTO, TimelineEventResponseDTO, CreateTimelineResponseDTO, GetTimelineEventDTO} from '../dtos/Timeline';
import { TimelineValidationMiddleware } from '../middlewares/TimelineValidationMiddleware';

@injectable()
export class TimelineController 
{
    public router: Router;

    constructor(
        @inject('ITimelineService') private timelineService: ITimelineService,
        @inject(TimelineValidationMiddleware) private validationMiddleware: TimelineValidationMiddleware
    ) 
    {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void 
    {
        const router = Router();
        
        // Ruta para guardar un timeline
        router.post('/save', 
            this.validationMiddleware.validateCreate() as RequestHandler,
            this.saveTimeline.bind(this) as RequestHandler
        );
        
        // Ruta para obtener un timeline por ID
        router.get('/get/:timelineId', 
            this.validationMiddleware.validateTimelineExists() as RequestHandler,
            this.getTimeline.bind(this) as RequestHandler
        );
        
        // Ruta para actualizar un timeline
        router.put('/update/:timelineId', 
            this.validationMiddleware.validateUpdate() as RequestHandler,
            this.updateTimeline.bind(this) as RequestHandler
        );

        this.router.use('/api/v1/timeline', router);
    }  

    async saveTimeline(req: Request, res: Response): Promise<void> {
        try {
            const timelineId = Number(req.params.timelineId);
            
            // Validate timelineId
            if (isNaN(timelineId) || timelineId <= 0) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid timeline ID'
                });
                return;
            }

            const timelineData = plainToInstance(CreateTimelineEventDTO, req.body);
    
            // Guardar la línea de tiempo y obtener el ID generado
            const savedTimelineId = await this.timelineService.saveTimeline(timelineId, timelineData);
    
            // Crear instancia del DTO de respuesta con solo el timeline_id
            const responseDTO = plainToInstance(CreateTimelineResponseDTO, { timeline_id: savedTimelineId });
    
            res.status(201).json({
                success: true,
                message: "Timeline saved successfully",
                data: responseDTO
            });
        } catch (error) {
            console.error('Error saving timeline:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    async getTimeline(req: Request, res: Response): Promise<void> {
        try {
            // Validate timelineId first
            const timelineId = Number(req.params.timelineId);
            if (isNaN(timelineId) || timelineId <= 0) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: [{
                        property: 'timeline_id',
                        constraints: {
                            isNumber: 'timeline_id must be a number conforming to the specified constraints'
                        }
                    }]
                });
                return;
            }

            // Convert to DTO and validate
            const dto = plainToInstance(GetTimelineEventDTO, { timeline_id: timelineId });
            const errors = await validate(dto);
            if (errors.length > 0) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors.map(error => ({
                        property: error.property,
                        constraints: error.constraints
                    }))
                });
                return;
            }

            // Get timeline from service
            const timeline = await this.timelineService.getTimeline(dto.timeline_id);
            if (!timeline) {
                res.status(404).json({ success: false, error: 'Timeline not found' });
                return;
            }

            // Convert to response DTO
            const responseDTO = plainToInstance(TimelineEventResponseDTO, timeline);
            res.status(200).json({
                success: true,
                data: responseDTO
            });
        } catch (error) {
            console.error('Error getting timeline:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }


    async updateTimeline(req: Request, res: Response): Promise<void> {
        try {
            // Validate timelineId first
            const timelineId = Number(req.params.timelineId);
            if (isNaN(timelineId) || timelineId <= 0) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: [{
                        property: 'timeline_id',
                        constraints: {
                            isNumber: 'timeline_id must be a number conforming to the specified constraints'
                        }
                    }]
                });
                return;
            }
    
            // Transform request body to DTO
            const timelineData = plainToInstance(UpdateTimelineEventDTO, req.body);
    
            // Validate numeric fields
            const validationErrors = [];
            
            if (timelineData.project_id !== undefined) {
                const projectId = Number(timelineData.project_id);
                if (isNaN(projectId) || projectId <= 0) {
                    validationErrors.push({
                        property: 'project_id',
                        constraints: {
                            isNumber: 'project_id must be a valid positive number'
                        }
                    });
                } else {
                    timelineData.project_id = projectId;
                }
            }
            
            if (timelineData.asset_id !== undefined) {
                const assetId = Number(timelineData.asset_id);
                if (isNaN(assetId) || assetId <= 0) {
                    validationErrors.push({
                        property: 'asset_id',
                        constraints: {
                            isNumber: 'asset_id must be a valid positive number'
                        }
                    });
                } else {
                    timelineData.asset_id = assetId;
                }
            }

            if (validationErrors.length > 0) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: validationErrors
                });
                return;
            }
    
            // Update timeline and get updated entity
            const updatedTimeline = await this.timelineService.updateTimeline(timelineId, timelineData);
    
            // Create response DTO
            const responseDTO = plainToInstance(TimelineEventResponseDTO, updatedTimeline);
    
            res.status(200).json({
                success: true,
                message: "Timeline updated successfully",
                data: responseDTO
            });
        } catch (error) {
            console.error('Error updating timeline:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }   
}
