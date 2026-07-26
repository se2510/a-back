export interface GenerationTask {
    id: string;
    status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';
    result?: {
        url?: string;
        outputUrls?: string[];
    };
    error?: string;
}

export interface GenerationRequest {
    prompt: string;
    options?: Record<string, unknown>;
}

export interface IMediaProvider {
    createTask(request: GenerationRequest): Promise<GenerationTask>;
    getTaskStatus(taskId: string): Promise<GenerationTask>;
    pollTaskUntilComplete(taskId: string, maxWaitTimeMs?: number): Promise<GenerationTask>;
} 