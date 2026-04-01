import { IsString, IsNotEmpty, IsOptional, IsInt, IsIn, IsDateString, IsArray } from 'class-validator';

export class CreateWorkOrderDto {
  @IsString()
  @IsNotEmpty()
  public title: string;

  @IsString()
  @IsNotEmpty()
  public content: string;

  @IsOptional()
  @IsString()
  public location?: string;

  @IsOptional()
  @IsDateString()
  public startDate?: string;

  @IsOptional()
  @IsDateString()
  public endDate?: string;

  @IsOptional()
  @IsString()
  public note?: string;

  @IsOptional()
  @IsInt()
  public assignedTo?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  public assignedToIds?: number[];
}

export class UpdateWorkOrderDto {
  @IsOptional()
  @IsString()
  public title?: string;

  @IsOptional()
  @IsString()
  public content?: string;

  @IsOptional()
  @IsString()
  public location?: string;

  @IsOptional()
  @IsDateString()
  public startDate?: string;

  @IsOptional()
  @IsDateString()
  public endDate?: string;

  @IsOptional()
  @IsString()
  public note?: string;

  @IsOptional()
  @IsInt()
  public assignedTo?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  public assignedToIds?: number[];

  @IsOptional()
  @IsString()
  @IsIn(['pending', 'approved', 'in_progress', 'submitted_for_review', 'completed', 'rework_requested', 'rejected', 'cancelled'])
  public status?: string;

  @IsOptional()
  @IsString()
  public rejectionReason?: string;
}
