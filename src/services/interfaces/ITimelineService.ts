import { CreateTimelineEventDTO, UpdateTimelineEventDTO, TimelineEventResponseDTO } from "../../dtos/Timeline";
import { TimelineEvent } from "../../entities/TimelineEvent";

export interface ITimelineService {
    saveTimeline(timelineId: number, timelineData: CreateTimelineEventDTO): Promise<void>;
    getTimeline(timelineId: number): Promise<TimelineEventResponseDTO>;
    updateTimeline(timelineId: number, timelineData: UpdateTimelineEventDTO): Promise<TimelineEventResponseDTO>;
    exists(timelineId: number): Promise<boolean>;
}