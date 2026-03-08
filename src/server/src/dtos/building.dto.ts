import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBuildingDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsOptional()
  @IsString()
  public description?: string;
}

export class UpdateBuildingDto {
  @IsOptional()
  @IsString()
  public name?: string;

  @IsOptional()
  @IsString()
  public description?: string;
}
