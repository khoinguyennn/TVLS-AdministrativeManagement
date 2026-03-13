import { IsString, IsOptional, IsIn, IsDateString } from 'class-validator';

export class UpdateStaffProfileDto {
  @IsOptional()
  @IsString()
  public staffCode?: string;

  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  public gender?: string;

  @IsOptional()
  @IsDateString()
  public dateOfBirth?: string;

  @IsOptional()
  @IsString()
  public cccdNumber?: string;

  @IsOptional()
  @IsDateString()
  public cccdIssueDate?: string;

  @IsOptional()
  @IsString()
  public cccdIssuePlace?: string;

  @IsOptional()
  @IsString()
  public ethnicity?: string;

  @IsOptional()
  @IsString()
  public religion?: string;

  @IsOptional()
  @IsIn(['working', 'resigned', 'transferred', 'maternity_leave', 'unpaid_leave'])
  public staffStatus?: string;

  @IsOptional()
  @IsDateString()
  public recruitmentDate?: string;

  // Addresses
  @IsOptional()
  public contactAddress?: {
    province?: string;
    ward?: string;
    hamlet?: string;
    detailAddress?: string;
    phone?: string;
  };

  @IsOptional()
  public hometownAddress?: {
    province?: string;
    ward?: string;
    hamlet?: string;
    detailAddress?: string;
  };

  @IsOptional()
  public organizations?: {
    isUnionMember?: boolean;
    unionJoinDate?: string;
    isPartyMember?: boolean;
    partyJoinDate?: string;
  };

  @IsOptional()
  public bankAccounts?: Array<{
    bankName?: string;
    branch?: string;
    accountNumber?: string;
  }>;

  @IsOptional()
  public positions?: Array<{
    jobPosition?: string;
    positionGroup?: string;
    recruitmentAgency?: string;
    professionWhenRecruited?: string;
    rankLevel?: string;
    educationLevel?: string;
    rankCode?: string;
    subjectGroup?: string;
    contractType?: string;
  }>;

  @IsOptional()
  public qualifications?: Array<{
    generalEducationLevel?: string;
    professionalLevel?: string;
    major?: string;
    trainingPlace?: string;
    graduationYear?: number;
    itLevel?: string;
    foreignLanguageLevel?: string;
  }>;

  @IsOptional()
  public salaries?: Array<{
    salaryCoefficient?: number;
    salaryLevel?: number;
    baseSalary?: number;
    salaryStartDate?: string;
    unionAllowancePercent?: number;
    seniorityAllowancePercent?: number;
    incentiveAllowancePercent?: number;
    positionAllowancePercent?: number;
    salaryNote?: string;
  }>;

  @IsOptional()
  public evaluations?: Array<{
    civilServantRating?: string;
    excellentTeacher?: boolean;
    evaluationYear?: number;
    note?: string;
  }>;
}
