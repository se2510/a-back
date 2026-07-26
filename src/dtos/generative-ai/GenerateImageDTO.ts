import {
    IsNotEmpty,
    IsString,
    IsInt,
    IsPositive,
    IsIn,
    MinLength,
    MaxLength,
    IsOptional,
    Matches,
} from 'class-validator';

export class GenerateImageDTO {
    @IsInt({ message: 'El projectId debe ser un número entero' })
    @IsPositive({ message: 'El projectId debe ser un número positivo' })
    @IsNotEmpty({ message: 'El projectId es requerido' })
    projectId!: number;

    @IsString({ message: 'El prompt debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El prompt es requerido' })
    @MinLength(10, { message: 'El prompt debe tener al menos 10 caracteres' })
    @MaxLength(2000, { message: 'El prompt no puede exceder 2000 caracteres' })
    @Matches(/^[a-zA-Z0-9\s\.,;:!?¿¡\-_()]+$/, {
        message:
            'El prompt contiene caracteres no permitidos. Solo se permiten letras, números, espacios y signos de puntuación básicos',
    })
    prompt!: string;

    @IsString({ message: 'El modelo debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El modelo es requerido' })
    @IsIn(
        [
            'google-image',
            'adobe-firefly',
            'stable-diffusion',
        ],
        {
            message:
                'El modelo debe ser uno de los siguientes: google-image, adobe-firefly, stable-diffusion',
        }
    )
    model!: string;

    @IsOptional()
    @IsString({ message: 'La resolución debe ser una cadena de texto' })
    @IsIn(['256x256', '512x512', '1024x1024', '2048x2048', '4096x4096'], { // Adjusted for typical image resolutions
        message: 'La resolución debe ser: 256x256, 512x512, 1024x1024, 2048x2048 o 4096x4096',
    })
    resolution?: string;

    @IsOptional()
    @IsString({ message: 'El estilo debe ser una cadena de texto' })
    @IsIn(['photorealistic', 'digital-art', 'comic-book', 'fantasy', 'isometric', 'pixel-art', 'line-art', 'watercolor', '3d-model'], { // Adjusted for typical image styles
        message:
            'El estilo debe ser: photorealistic, digital-art, comic-book, fantasy, isometric, pixel-art, line-art, watercolor, 3d-model',
    })
    style?: string;

    @IsOptional()
    @IsInt({ message: 'El referenceImageId debe ser un número entero' })
    @IsPositive({ message: 'El referenceImageId debe ser un número positivo' })
    referenceImageId?: number;
}
