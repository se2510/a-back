import { IsEnum, IsNumber, IsOptional, IsObject, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { EventType } from '../types/EventType';

/**
 * DTO para la actualización de un evento existente de un timeline.
 * Se requiere timeline_id y los demás id para identificar el registro a actualizar.
 * Los demás campos son opcionales para permitir actualizaciones parciales.
 */
export class UpdateTimelineEventDTO {
  
    @IsOptional()
    @IsNumber()
    project_id!: number;
  
    @IsOptional()//se puede qquitar porque se conserva el mismo tipo
    @IsEnum(EventType, {
      message: 'event_type must be one of: clip, text, or audio',
    })
    event_type?: EventType;
  
    @IsOptional()
    @IsNumber()
    asset_id!: number;
  
    @IsOptional()
    @IsNumber()
    start_time?: number;
  
    @IsOptional()
    @IsNumber()
    end_time?: number;
  
    @IsOptional()
    @IsObject()
    properties?: Record<string, any>;
  }