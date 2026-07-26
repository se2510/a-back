import { IsNotEmpty, IsPositive } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetStatusDTO {
    @Transform(({ value }: { value: string }) => {
        const parsedValue = parseInt(value, 10);
        if (isNaN(parsedValue)) {
            throw new Error('El jobId debe ser un número válido');
        }

        return parsedValue;
    })
    @Type(() => Number)
    @IsPositive({ message: 'El jobId debe ser un número positivo' })
    @IsNotEmpty({ message: 'El jobId es requerido' })
    jobId!: number;
}
