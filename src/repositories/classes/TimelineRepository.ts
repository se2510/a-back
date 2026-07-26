import { ITimelineRepository } from "../interfaces/ITimelineRepository";

export class TimelineRepository implements ITimelineRepository 
{
    SaveTimeline(userId: number, timeLineData: any): Promise<void> 
    {
        throw new Error("Method not implemented.");
    }
    GetTimeline(userId: number): Promise<any> 
    {
        throw new Error("Method not implemented.");
    }
    UpdateTimeline(userId: number, timeLineData: any): Promise<void> 
    {
        throw new Error("Method not implemented.");
    }
}