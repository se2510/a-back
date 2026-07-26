
import { IsInt } from "class-validator";
import { Type } from "class-transformer";

export class ProjectIDParamDto {
    @IsInt({ message: 'El ID del proyecto debe ser un número entero.' })
    @Type(() => Number)
    projectId!: number;
}