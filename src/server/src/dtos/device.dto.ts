import { IsString, IsNotEmpty, IsOptional, IsIn, IsInt } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsOptional()
  @IsInt()
  public roomId?: number;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'under_repair', 'waiting_replacement', 'broken'])
  public status?: string;
}

export class UpdateDeviceDto {
  @IsOptional()
  @IsString()
  public name?: string;

  @IsOptional()
  @IsInt()
  public roomId?: number;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'under_repair', 'waiting_replacement', 'broken'])
  public status?: string;
}
