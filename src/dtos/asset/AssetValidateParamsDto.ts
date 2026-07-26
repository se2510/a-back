import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AssetValidateParamsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'projectId debe ser un número entero válido.' })
  @Min(1, { message: 'projectId debe ser mayor a 0.' })
  projectId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'assetId debe ser un número entero válido.' })
  @Min(1, { message: 'assetId debe ser mayor a 0.' })
  assetId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page debe ser un número entero válido.' })
  @Min(1, { message: 'page debe ser mayor a 0.' })
  page?: number;
}
