import { IsEnum, IsOptional, Validate, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Type } from 'class-transformer';

// Validador personalizado para limitar el número de campos en un objeto JSON
@ValidatorConstraint({ name: 'MaxFields', async: false })
class MaxFieldsValidator implements ValidatorConstraintInterface {
  validate(value: Record<string, any>): boolean {
    return Object.keys(value).length <= 100;
  }

  defaultMessage(): string {
    return 'metadata no debe contener más de 100 campos.';
  }
}

export enum AssetType {
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  SCRIPT = 'script'
}

export class AssetValidateBodyDto {
  @IsOptional()
  @IsEnum(AssetType, { message: 'type debe ser uno de los valores permitidos: image, audio, video, script.' })
  type?: AssetType;


  @IsOptional()
  @Type(() => Object)
  @Validate(MaxFieldsValidator, { message: 'metadata no debe contener más de 100 campos.' })
  metadata?: Record<string, any>;
}