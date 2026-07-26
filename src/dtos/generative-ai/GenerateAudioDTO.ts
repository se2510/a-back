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

export class GenerateAudioDTO {
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
        ['eleven-labs', 'murf-ai', 'speechify', 'azure-speech', 'google-tts'],
        {
            message:
                'El modelo debe ser uno de los siguientes: eleven-labs, murf-ai, speechify, azure-speech, google-tts',
        }
    )
    model!: string;

    @IsOptional()
    @IsInt({ message: 'La duración debe ser un número entero' })
    @Min(1, { message: 'La duración mínima es 1 segundo' })
    @Max(600, { message: 'La duración máxima es 600 segundos (10 minutos)' })
    duration?: number;

    @IsOptional()
    @IsString({ message: 'La calidad debe ser una cadena de texto' })
    @IsIn(['low', 'medium', 'high', 'ultra'], {
        message: 'La calidad debe ser: low, medium, high o ultra',
    })
    quality?: string;

    @IsOptional()
    @IsString({ message: 'El tipo de sonido debe ser una cadena de texto' })
    @IsIn(
        [
            'music',
            'effects',
            'voice',
            'dialogue',
            'ambience',
            'sound effects',
            'background music',
        ],
        {
            message:
                'El tipo de sonido debe ser: music, effects, voice, dialogue, ambience, sound effects, background music',
        }
    )
    soundType?: string;

    @IsOptional()
    @IsString({ message: 'La voz debe ser una cadena de texto' })
    @IsIn(['male', 'female', 'neutral', 'child'], {
        message: 'La voz debe ser: male, female, neutral o child',
    })
    voice?: string;

    @IsOptional()
    @IsString({ message: 'El idioma debe ser una cadena de texto' })
    @IsIn(['es', 'en', 'fr', 'de', 'it', 'pt'], {
        message: 'El idioma debe ser: es, en, fr, de, it o pt',
    })
    language?: string;

    @IsOptional()
    @IsInt({ message: 'La velocidad debe ser un número entero' })
    @Min(50, { message: 'La velocidad mínima es 50%' })
    @Max(200, { message: 'La velocidad máxima es 200%' })
    speed?: number;
}
