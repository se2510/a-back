import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

export type FileType = 'imagen' | 'video' | 'audio';

interface FileTypeConfig {
    fieldName: string;
    mimeTypes: string[];
}

interface UploadConfig {
    maxFileSize: number;
    maxFiles: number;
}

const FILE_TYPES_CONFIG: Record<FileType, FileTypeConfig> = {
    imagen: {
        fieldName: 'referenceImage',
        mimeTypes: [
            'image/jpeg', 
            'image/png', 
            'image/gif', 
            'image/webp', 
            'image/bmp'
        ]
    },
    video: {
        fieldName: 'referenceVideo',
        mimeTypes: [
            'video/mp4', 
            'video/avi', 
            'video/mov', 
            'video/wmv', 
            'video/flv', 
            'video/webm', 
            'video/mkv'
        ]
    },
    audio: {
        fieldName: 'referenceAudio',
        mimeTypes: [
            'audio/mpeg', 
            'audio/mp3', 
            'audio/wav', 
            'audio/ogg', 
            'audio/aac', 
            'audio/m4a', 
            'audio/m4b', 
            'audio/m4p', 
            'audio/m4v'
        ]
    }
};

const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 3 
};

const getAllowedMimeTypes = (allowedTypes: FileType[]): string[] => {
    return allowedTypes.flatMap(type => FILE_TYPES_CONFIG[type].mimeTypes);
};

const getFieldsConfiguration = (allowedTypes: FileType[]): { name: string; maxCount: number }[] => {
    return allowedTypes.map(type => ({
        name: FILE_TYPES_CONFIG[type].fieldName,
        maxCount: 1
    }));
};

const createFileFilter = (allowedMimeTypes: string[], allowedTypes: FileType[]) => {
    return (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            const typeNames = allowedTypes.join(', ');
            const error = new Error(`Tipo de archivo no permitido. Solo se admiten: ${typeNames}`);
            error.name = 'MulterFileTypeError';
            cb(error);
        }
    };
};

const extractFilesToRequestProperties = (req: Request, allowedTypes: FileType[]): void => {
    if (!req.files || typeof req.files !== 'object' || Array.isArray(req.files)) {
        return;
    }

    const filesObject = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    allowedTypes.forEach(type => {
        const config = FILE_TYPES_CONFIG[type];
        const files = filesObject[config.fieldName];
        const file = files?.[0];
        
        if (file) {
            (req as any)[config.fieldName] = file;
        }
    });
};

export const uploadMiddleware = (
    allowedTypes: FileType | FileType[], 
    config: Partial<UploadConfig> = {}
) => {
    const typesArray: FileType[] = Array.isArray(allowedTypes) ? allowedTypes : [allowedTypes];
    
    if (!typesArray.length) {
        throw new Error('Debe especificar al menos un tipo de archivo permitido');
    }

    const uploadConfig = { ...DEFAULT_UPLOAD_CONFIG, ...config };
    const allowedMimeTypes = getAllowedMimeTypes(typesArray);
    const fields = getFieldsConfiguration(typesArray);
    
    const upload = multer({
        storage: multer.memoryStorage(),
        fileFilter: createFileFilter(allowedMimeTypes, typesArray),
        limits: {
            fileSize: uploadConfig.maxFileSize,
            files: Math.min(typesArray.length, uploadConfig.maxFiles),
        },
    });

    const multerMiddleware = upload.fields(fields);

    return (req: Request, res: Response, next: NextFunction) => {
        multerMiddleware(req, res, (err) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    switch (err.code) {
                        case 'LIMIT_FILE_SIZE':
                            err.message = `Archivo demasiado grande. Tamaño máximo: ${uploadConfig.maxFileSize / (1024 * 1024)}MB`;
                            break;
                        case 'LIMIT_FILE_COUNT':
                            err.message = `Demasiados archivos. Máximo permitido: ${uploadConfig.maxFiles}`;
                            break;
                        case 'LIMIT_UNEXPECTED_FILE':
                            err.message = 'Campo de archivo inesperado';
                            break;
                    }
                }
                return next(err);
            }

            try {
                extractFilesToRequestProperties(req, typesArray);
                next();
            } catch (extractionError) {
                next(extractionError);
            }
        });
    };
};
