import {
    IsNotEmpty,
    IsString,
    IsInt,
    IsPositive,
    IsIn,
    MinLength,
    MaxLength,
    IsOptional,
    Min,
    Max,
    Matches,
} from 'class-validator';

export class GenerateVideoDTO {
    @IsInt({ message: 'El projectId debe ser un número entero' })
    @IsPositive({ message: 'El projectId debe ser un número positivo' })
    @IsNotEmpty({ message: 'El projectId es requerido' })
    projectId!: number;

    @IsString({ message: 'El prompt debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El prompt es requerido' })
    @MinLength(10, { message: 'El prompt debe tener al menos 10 caracteres' })
    @MaxLength(2000, { message: 'El prompt no puede exceder 2000 caracteres' })
    prompt!: string;

    @IsNotEmpty({ message: 'El modelo es requerido' })
    @IsIn(
        [
            'stable-diffusion-video',
            'runway-ml',
            'pika-labs',
            'synthesia',
            'luma-ai',
        ],
        {
            message:
                'El modelo debe ser uno de los siguientes: stable-diffusion-video, runway-ml, pika-labs, synthesia, luma-ai',
        }
    )
    model!: string;

    @IsOptional()
    @IsInt({ message: 'La duración debe ser un número entero' })
    @Min(1, { message: 'La duración mínima es 1 segundo' })
    @Max(300, { message: 'La duración máxima es 300 segundos (5 minutos)' })
    duration?: number;

    @IsOptional()
    @IsString({ message: 'La resolución debe ser una cadena de texto' })
    @IsIn(['480p', '720p', '1080p', '4k'], {
        message: 'La resolución debe ser: 480p, 720p, 1080p o 4k',
    })
    resolution?: string;

    @IsOptional()
    @IsString({ message: 'El estilo debe ser una cadena de texto' })
    @IsIn(['realistic', 'animated', 'artistic', 'cinematic', 'documentary'], {
        message:
            'El estilo debe ser: realistic, animated, artistic, cinematic o documentary',
    })
    style?: string;

    @IsOptional()
    @IsInt({ message: 'El frameRate debe ser un número entero' })
    @IsIn([24, 30, 60], {
        message: 'El frameRate debe ser: 24, 30 o 60 fps',
    })
    frameRate?: number;

    @IsOptional()
    @IsInt({ message: 'El referenceImageId debe ser un número entero' })
    @IsPositive({ message: 'El referenceImageId debe ser un número positivo' })
    referenceImageId?: number;
}
