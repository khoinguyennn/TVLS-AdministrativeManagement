import { IsString, IsNotEmpty, IsOptional, IsInt, IsIn, IsDateString } from 'class-validator';

export class CreateLeaveRequestDto {
  @IsInt()
  @IsNotEmpty()
  public leaveTypeId: number;

  @IsDateString()
  @IsNotEmpty()
  public startDate: string;

  @IsDateString()
  @IsNotEmpty()
  public endDate: string;

  @IsInt()
  @IsNotEmpty()
  public totalDays: number;

  @IsOptional()
  @IsString()
  public reason?: string;
}

export class UpdateLeaveRequestDto {
  @IsOptional()
  @IsString()
  @IsIn(['approved', 'rejected'])
  public status?: string;

  @IsOptional()
  @IsString()
  public rejectedReason?: string;
}

export class CreateLeaveTypeDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsOptional()
  @IsInt()
  public maxDaysPerYear?: number;
}

export class CreateLeaveBalanceDto {
  @IsInt()
  @IsNotEmpty()
  public userId: number;

  @IsInt()
  @IsNotEmpty()
  public year: number;

  @IsInt()
  @IsNotEmpty()
  public totalDays: number;
}
