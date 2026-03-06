import { IsString, IsNotEmpty, IsOptional, IsIn, IsInt, Min } from 'class-validator';

export class CreateBuildingDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public code: string;

  @IsOptional()
  @IsString()
  public address?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  public floors?: number;

  @IsOptional()
  @IsString()
  public description?: string;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'maintenance'])
  public status?: string;
}

export class UpdateBuildingDto {
  @IsOptional()
  @IsString()
  public name?: string;

  @IsOptional()
  @IsString()
  public code?: string;

  @IsOptional()
  @IsString()
  public address?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  public floors?: number;

  @IsOptional()
  @IsString()
  public description?: string;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'maintenance'])
  public status?: string;
}
