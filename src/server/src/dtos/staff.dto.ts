import { IsString, IsNotEmpty, IsOptional, IsInt, IsIn, IsDateString, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StaffPositionDto {
  @IsOptional() @IsString() public jobPosition?: string;
  @IsOptional() @IsString() public positionGroup?: string;
  @IsOptional() @IsString() public recruitmentAgency?: string;
  @IsOptional() @IsString() public professionWhenRecruited?: string;
  @IsOptional() @IsString() public rankLevel?: string;
  @IsOptional() @IsString() public educationLevel?: string;
  @IsOptional() @IsString() public rankCode?: string;
  @IsOptional() @IsString() public subjectGroup?: string;
  @IsOptional() @IsString() public contractType?: string;
}

export class StaffQualificationDto {
  @IsOptional() @IsString() public generalEducationLevel?: string;
  @IsOptional() @IsString() public professionalLevel?: string;
  @IsOptional() @IsString() public major?: string;
  @IsOptional() @IsString() public trainingPlace?: string;
  @IsOptional() @IsInt() public graduationYear?: number;
  @IsOptional() @IsString() public itLevel?: string;
  @IsOptional() @IsString() public foreignLanguageLevel?: string;
}

export class StaffAddressDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['contact', 'hometown'])
  public addressType: string;

  @IsOptional() @IsString() public province?: string;
  @IsOptional() @IsString() public ward?: string;
  @IsOptional() @IsString() public hamlet?: string;
  @IsOptional() @IsString() public detailAddress?: string;
  @IsOptional() @IsString() public phone?: string;
}

export class StaffBankAccountDto {
  @IsOptional() @IsString() public bankName?: string;
  @IsOptional() @IsString() public branch?: string;
  @IsOptional() @IsString() public accountNumber?: string;
}

export class StaffEvaluationDto {
  @IsOptional() @IsString() public civilServantRating?: string;
  @IsOptional() @IsBoolean() public excellentTeacher?: boolean;
  @IsOptional() @IsInt() public evaluationYear?: number;
  @IsOptional() @IsString() public note?: string;
}

export class StaffOrganizationDto {
  @IsOptional() @IsBoolean() public isUnionMember?: boolean;
  @IsOptional() @IsDateString() public unionJoinDate?: string;
  @IsOptional() @IsBoolean() public isPartyMember?: boolean;
  @IsOptional() @IsDateString() public partyJoinDate?: string;
}

export class StaffSalaryDto {
  @IsOptional() public salaryCoefficient?: number;
  @IsOptional() @IsInt() public salaryLevel?: number;
  @IsOptional() @IsInt() public baseSalary?: number;
  @IsOptional() @IsDateString() public salaryStartDate?: string;
  @IsOptional() public unionAllowancePercent?: number;
  @IsOptional() public seniorityAllowancePercent?: number;
  @IsOptional() public incentiveAllowancePercent?: number;
  @IsOptional() public positionAllowancePercent?: number;
  @IsOptional() @IsString() public salaryNote?: string;
}

export class CreateStaffProfileDto {
  @IsOptional()
  @IsInt()
  public userId?: number;

  @IsOptional()
  @IsString()
  public email?: string;

  @IsOptional()
  @IsString()
  public fullName?: string;

  @IsOptional()
  @IsString()
  @IsIn(['admin', 'manager', 'teacher', 'technician'])
  public role?: string;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'locked'])
  public status?: string;

  @IsString()
  @IsNotEmpty()
  public staffCode: string;

  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  public gender?: string;

  @IsOptional()
  @IsDateString()
  public dateOfBirth?: string;

  @IsOptional() @IsString() public cccdNumber?: string;
  @IsOptional() @IsDateString() public cccdIssueDate?: string;
  @IsOptional() @IsString() public cccdIssuePlace?: string;
  @IsOptional() @IsString() public ethnicity?: string;
  @IsOptional() @IsString() public religion?: string;

  @IsOptional()
  @IsIn(['working', 'probation', 'maternity_leave', 'retired', 'resigned'])
  public staffStatus?: string;

  @IsOptional()
  @IsDateString()
  public recruitmentDate?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => StaffPositionDto)
  public position?: StaffPositionDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => StaffQualificationDto)
  public qualification?: StaffQualificationDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => StaffAddressDto)
  public addresses?: StaffAddressDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => StaffBankAccountDto)
  public bankAccount?: StaffBankAccountDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => StaffEvaluationDto)
  public evaluation?: StaffEvaluationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => StaffOrganizationDto)
  public organization?: StaffOrganizationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => StaffSalaryDto)
  public salary?: StaffSalaryDto;
}

export class UpdateStaffProfileDto {
  @IsOptional()
  @IsInt()
  public userId?: number;

  @IsOptional()
  @IsString()
  public staffCode?: string;

  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  public gender?: string;

  @IsOptional()
  @IsDateString()
  public dateOfBirth?: string;

  @IsOptional() @IsString() public cccdNumber?: string;
  @IsOptional() @IsDateString() public cccdIssueDate?: string;
  @IsOptional() @IsString() public cccdIssuePlace?: string;
  @IsOptional() @IsString() public ethnicity?: string;
  @IsOptional() @IsString() public religion?: string;

  @IsOptional()
  @IsIn(['working', 'probation', 'maternity_leave', 'retired', 'resigned'])
  public staffStatus?: string;

  @IsOptional()
  @IsDateString()
  public recruitmentDate?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => StaffPositionDto)
  public position?: StaffPositionDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => StaffQualificationDto)
  public qualification?: StaffQualificationDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => StaffAddressDto)
  public addresses?: StaffAddressDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => StaffBankAccountDto)
  public bankAccount?: StaffBankAccountDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => StaffEvaluationDto)
  public evaluation?: StaffEvaluationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => StaffOrganizationDto)
  public organization?: StaffOrganizationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => StaffSalaryDto)
  public salary?: StaffSalaryDto;
}
