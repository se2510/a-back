import { Request, Response, Router } from 'express';
import { injectable, inject } from 'tsyringe';
import { ITimelineService } from '../services/interfaces/ITimelineService';

@injectable()
export class TimelineController 
{
    public router = Router();

    constructor(@inject('ITimelineService') private svc: ITimelineService) 
    {
        this.router.post('/timeline/save', this.SaveTimeline.bind(this));
        this.router.get('/timeline/get{timelineId}', this.GetTimeline.bind(this));
        this.router.put('/timeline/update/{timelineId}', this.UpdateTimeline.bind(this));
    }  

    async SaveTimeline() 
    {
        throw new Error('Method not implemented.');
    }

    async GetTimeline() 
    {
     throw new Error('Method not implemented.');
    }

    async UpdateTimeline()
    {
        throw new Error('Method not implemented.');
    }    
}
