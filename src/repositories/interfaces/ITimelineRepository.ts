import { TimelineEvent } from "../../entities/TimelineEvent";
import { CreateTimelineEventDTO, UpdateTimelineEventDTO } from "../../dtos/Timeline";

export interface ITimelineRepository {
    exists(timelineId: number): Promise<boolean>;
    saveTimeline(timelineId: number, timelineData: CreateTimelineEventDTO): Promise<void>;
    getTimeline(timelineId: number): Promise<TimelineEvent>;
    updateTimeline(timelineId: number, timelineData: UpdateTimelineEventDTO): Promise<TimelineEvent>;
}