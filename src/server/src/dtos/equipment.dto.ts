import { IsString, IsNotEmpty, IsOptional, IsIn, IsInt, IsNumber, Min, IsDateString } from 'class-validator';

export class CreateEquipmentDto {
  @IsInt()
  @IsNotEmpty()
  public roomId: number;

  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public code: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['computer', 'projector', 'furniture', 'lab-equipment', 'other'])
  public category: string;

  @IsOptional()
  @IsString()
  public brand?: string;

  @IsOptional()
  @IsString()
  public model?: string;

  @IsOptional()
  @IsString()
  public serialNumber?: string;

  @IsOptional()
  @IsDateString()
  public purchaseDate?: string;

  @IsOptional()
  @IsDateString()
  public warrantyExpiry?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  public price?: number;

  @IsOptional()
  @IsString()
  @IsIn(['working', 'broken', 'maintenance', 'disposed'])
  public status?: string;

  @IsOptional()
  @IsString()
  public description?: string;
}

export class UpdateEquipmentDto {
  @IsOptional()
  @IsInt()
  public roomId?: number;

  @IsOptional()
  @IsString()
  public name?: string;

  @IsOptional()
  @IsString()
  public code?: string;

  @IsOptional()
  @IsString()
  @IsIn(['computer', 'projector', 'furniture', 'lab-equipment', 'other'])
  public category?: string;

  @IsOptional()
  @IsString()
  public brand?: string;

  @IsOptional()
  @IsString()
  public model?: string;

  @IsOptional()
  @IsString()
  public serialNumber?: string;

  @IsOptional()
  @IsDateString()
  public purchaseDate?: string;

  @IsOptional()
  @IsDateString()
  public warrantyExpiry?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  public price?: number;

  @IsOptional()
  @IsString()
  @IsIn(['working', 'broken', 'maintenance', 'disposed'])
  public status?: string;

  @IsOptional()
  @IsString()
  public description?: string;
}
