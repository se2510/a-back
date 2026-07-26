import { IsString, IsOptional } from 'class-validator';

export class ProjectDto 
{
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
