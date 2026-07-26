import { EventType } from '../types/EventType';

/**
 * DTO para la respuesta al consultar datos de un evento.
 * Se incluyen los campos gestionados por la base de datos, como timeline_id,
 * created_at y updated_at.
 */
export class TimelineEventResponseDTO {
  timeline_id!: number;

  project_id!: number;

  event_type!: EventType;

  asset_id!: number;

  start_time!: number;

  end_time!: number;

  properties?: Record<string, any>;

  created_at?: Date;

  updated_at?: Date;
}
