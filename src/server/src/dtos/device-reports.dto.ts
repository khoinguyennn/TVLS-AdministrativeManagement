import { IsString, IsNotEmpty, IsOptional, IsIn, IsInt } from 'class-validator';

export class CreateDeviceReportDto {
  @IsNotEmpty()
  public deviceId: number;

  @IsString()
  @IsNotEmpty()
  public description: string;

  @IsOptional()
  @IsString()
  public imageUrl?: string;
}

export class UpdateDeviceReportDto {
  @IsOptional()
  @IsString()
  public description?: string;

  @IsOptional()
  @IsString()
  public imageUrl?: string;

  @IsOptional()
  @IsInt()
  public assignedTo?: number;

  @IsOptional()
  @IsString()
  @IsIn(['pending', 'received', 'repairing', 'repaired', 'waiting_replacement', 'unfixable', 'recheck_required', 'completed'])
  public status?: string;

  @IsOptional()
  @IsString()
  public technicianNote?: string;
}
