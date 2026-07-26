import { IsNumber, IsOptional, IsObject, IsDate } from 'class-validator';

export class GetTimelineEventDTO { 
    @IsNumber()
    timeline_id!: number;
}