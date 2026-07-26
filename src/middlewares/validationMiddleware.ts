import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';

export function validationMiddleware<T extends object>(
    DtoClass: new () => T,
    property: 'body' | 'query' | 'params' = 'body'
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dto = Object.assign(new DtoClass(), req[property]);
            const errors: ValidationError[] = await validate(dto);

            if (errors.length > 0) {
                const errorMessages = errors.map(error => ({
                    property: error.property,
                    constraints: error.constraints,
                    value: error.value,
                }));

                res.status(400).json({
                    error: 'Errores de validación',
                    details: errorMessages,
                });
            } else {
                req[property] = dto;
                next();
            }
        } catch (error) {
            res.status(500).json({
                error: 'Error interno del servidor durante la validación',
                details:
                    error instanceof Error
                        ? error.message
                        : 'Error desconocido',
            });
        }
    };
}
