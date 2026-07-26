import { IsString, IsOptional } from 'class-validator';

export class ProjectDto 
{
  @IsString() //nombre del proyecto
  name!: string;

  @IsOptional()
  @IsString() //descripcion del proyecto
  description?: string;
}


