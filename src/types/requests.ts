import { Request } from 'express';

export interface TypedRequestBody<T> extends Request {
    validatedBody?: T;
}

export interface TypedRequestParams<T> extends Request {
    validatedParams?: T;
}

export interface TypedRequestQuery<T> extends Request {
    validatedQuery?: T;
}

export interface TypedRequest<TBody = object, TParams = object, TQuery = object>
    extends Request {
    validatedBody?: TBody;
    validatedParams?: TParams;
    validatedQuery?: TQuery;
}

export interface TypedFilesRequestBody<T> extends Request {
    validatedBody?: T;
    files?: {
        [fieldname: string]: Express.Multer.File[];
    } | Express.Multer.File[];
    referenceImage?: Express.Multer.File;
    referenceVideo?: Express.Multer.File;
    referenceAudio?: Express.Multer.File;
}
