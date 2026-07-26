import { ITimelineService } from "../interfaces/ITimelineService";

export class TimelineService implements ITimelineService 
{
    SaveTimeline(userId: number, timeLineData: any): Promise<void> {
        throw new Error("Method not implemented.");
    }
    GetTimeline(userId: number): Promise<any> {
        throw new Error("Method not implemented.");
    }
    UpdateTimeline(userId: number, timeLineData: any): Promise<void> {
        throw new Error("Method not implemented.");
    }
  
} 