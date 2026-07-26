import { IsEnum, IsNumber, IsOptional, IsObject, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { EventType } from '../types/EventType';

/**
 * DTO para la creación de un nuevo evento en un timeline.
 * No se incluye timeline_id, created_at y updated_at ya que
 * son administrados por la base de datos.
 * ! asegura que le van a pasar ese parámetro
 * ? no es obligatorio
 */
export class CreateTimelineEventDTO { //solo se debe retornnar el timeline id
    @IsNumber()
    project_id!: number;

    @IsEnum(EventType, {
    message: 'event_type must be one of: clip, text, or audio',
    })
    event_type!: EventType;

    @IsNumber()
    asset_id!: number;

    @IsNumber()
    start_time!: number;

    @IsNumber()
    end_time!: number;

    // Permite almacenar información adicional en formato JSON.
    @IsOptional()
    @IsObject()
    properties?: Record<string, any>;
}