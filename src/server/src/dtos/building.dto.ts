import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateBuildingDto {
  @IsString()
  @IsNotEmpty()
  public code: string;

  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  public floors?: number;

  @IsOptional()
  @IsString()
  public description?: string;
}

export class UpdateBuildingDto {
  @IsOptional()
  @IsString()
  public code?: string;

  @IsOptional()
  @IsString()
  public name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  public floors?: number;

  @IsOptional()
  @IsString()
  public description?: string;
}
