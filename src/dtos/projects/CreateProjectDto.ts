
import { 
  IsString, 
  IsOptional,
  Length,
  IsNotEmpty 
} from 'class-validator';

export class CreateProjectDto
{
  @IsString()
  @IsNotEmpty({message: 'El nombre es obligatorio.'})
  @Length(10, 50, {message: 'El nombre debe tener entre 10 y 50 caracteres.'})
  name!: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000, {message: 'La descripción debe tener un máximo de 2000 caracteres.'})
  description?: string;
}