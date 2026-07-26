export interface ITimelineRepository
{
   SaveTimeline(userId: number, timeLineData: any): Promise<void>;
   GetTimeline(userId: number): Promise<any>;
   UpdateTimeline(userId: number, timeLineData: any): Promise<void>;
}