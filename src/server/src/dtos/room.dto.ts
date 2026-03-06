import { IsString, IsNotEmpty, IsOptional, IsIn, IsInt, Min, IsNumber } from 'class-validator';

export class CreateRoomDto {
  @IsInt()
  @IsNotEmpty()
  public buildingId: number;

  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public code: string;

  @IsOptional()
  @IsInt()
  public floor?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  public capacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  public area?: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['classroom', 'lab', 'office', 'meeting', 'storage', 'other'])
  public type: string;

  @IsOptional()
  @IsString()
  @IsIn(['available', 'occupied', 'maintenance', 'unavailable'])
  public status?: string;

  @IsOptional()
  @IsString()
  public description?: string;
}

export class UpdateRoomDto {
  @IsOptional()
  @IsInt()
  public buildingId?: number;

  @IsOptional()
  @IsString()
  public name?: string;

  @IsOptional()
  @IsString()
  public code?: string;

  @IsOptional()
  @IsInt()
  public floor?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  public capacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  public area?: number;

  @IsOptional()
  @IsString()
  @IsIn(['classroom', 'lab', 'office', 'meeting', 'storage', 'other'])
  public type?: string;

  @IsOptional()
  @IsString()
  @IsIn(['available', 'occupied', 'maintenance', 'unavailable'])
  public status?: string;

  @IsOptional()
  @IsString()
  public description?: string;
}
