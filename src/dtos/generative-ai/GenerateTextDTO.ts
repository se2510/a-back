import {
    IsNotEmpty,
    IsString,
    IsInt,
    IsPositive,
    IsIn,
    MinLength,
    MaxLength,
    Matches,
} from 'class-validator';

export class GenerateTextDTO {
    @IsInt({ message: 'El projectId debe ser un número entero' })
    @IsPositive({ message: 'El projectId debe ser un número positivo' })
    @IsNotEmpty({ message: 'El projectId es requerido' })
    projectId!: number;

    @IsString({ message: 'El prompt debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El prompt es requerido' })
    @MinLength(5, { message: 'El prompt debe tener al menos 5 caracteres' })
    @MaxLength(4000, { message: 'El prompt no puede exceder 4000 caracteres' })
    prompt!: string;

    @IsString({ message: 'El modelo debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El modelo es requerido' })
    @IsIn(
        [
            'gpt-4o',
            'gemini2.5',
        ],
        {
            message:
                "El modelo debe ser uno de los siguientes: 'gpt-4o', 'gemini2.5'",
        }
    )
    model!: string;
}
