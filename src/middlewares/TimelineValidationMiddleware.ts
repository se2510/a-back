import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateTimelineEventDTO, UpdateTimelineEventDTO } from '../dtos/Timeline';
import { ITimelineService } from '../services/interfaces/ITimelineService';
import { injectable, inject } from 'tsyringe';

@injectable()
export class TimelineValidationMiddleware {
    constructor(
        @inject('ITimelineService') private timelineService: ITimelineService
    ) {}

    validateCreate() {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                // Validar DTO
                const timelineData = plainToClass(CreateTimelineEventDTO, req.body);
                const errors = await validate(timelineData);

                if (errors.length > 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Validation failed',
                        details: errors.map(error => ({
                            property: error.property,
                            constraints: error.constraints
                        }))
                    });
                }

                // Validar que el timeline no existe, si ya existye mando errro y avisa que ya existe
                const timelineExists = await this.timelineService.exists(Number(req.params.timelineId));
                if (timelineExists) {
                    return res.status(409).json({
                        success: false,
                        error: `Timeline with ID ${req.params.timelineId} already exists`
                    });
                }

                req.body = timelineData;
                next();
            } catch (error) {
                next(error);
            }
        };
    }

    validateUpdate() {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                // Extraer y transformar el timelineId una sola vez
                const timelineId = Number(req.params.timelineId);
    
                // Validar DTO
                const timelineData = plainToClass(UpdateTimelineEventDTO, req.body);
                const errors = await validate(timelineData);
                if (errors.length > 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Validation failed',
                        details: errors.map(error => ({
                            property: error.property,
                            constraints: error.constraints
                        }))
                    });
                }
    
                // Validar que el timeline existe
                const timelineExists = await this.timelineService.exists(timelineId);
                if (!timelineExists) {
                    return res.status(404).json({
                        success: false,
                        error: `Timeline with ID ${timelineId} not found`
                    });
                }
    
                req.body = timelineData;
                next();
            } catch (error) {
                next(error);
            }
        };
    }

    validateTimelineExists() {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const timelineId = Number(req.params.timelineId);
                const timelineExists = await this.timelineService.exists(timelineId);
                if (!timelineExists) {
                    return res.status(404).json({
                        success: false,
                        error: `Timeline with ID ${timelineId} not found`
                    });
                }
                next();
            } catch (error) {
                next(error);
            }
        };
    }
} 