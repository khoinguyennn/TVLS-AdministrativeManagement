export interface StaffProfile {
  id?: number;
  userId: number;
  staffCode: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  cccdNumber?: string;
  cccdIssueDate?: string;
  cccdIssuePlace?: string;
  ethnicity?: string;
  religion?: string;
  staffStatus?: 'working' | 'resigned' | 'transferred' | 'maternity_leave' | 'unpaid_leave';
  recruitmentDate?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StaffAddress {
  id?: number;
  staffProfileId: number;
  addressType: 'contact' | 'hometown';
  province?: string;
  ward?: string;
  hamlet?: string;
  detailAddress?: string;
  phone?: string;
}

export interface StaffBankAccount {
  id?: number;
  staffProfileId: number;
  bankName?: string;
  branch?: string;
  accountNumber?: string;
}

export interface StaffOrganization {
  id?: number;
  staffProfileId: number;
  isUnionMember?: boolean;
  unionJoinDate?: string;
  isPartyMember?: boolean;
  partyJoinDate?: string;
}

export interface StaffPosition {
  id?: number;
  staffProfileId: number;
  jobPosition?: string;
  positionGroup?: string;
  recruitmentAgency?: string;
  professionWhenRecruited?: string;
  rankLevel?: string;
  educationLevel?: string;
  rankCode?: string;
  subjectGroup?: string;
  contractType?: string;
}

export interface StaffQualification {
  id?: number;
  staffProfileId: number;
  generalEducationLevel?: string;
  professionalLevel?: string;
  major?: string;
  trainingPlace?: string;
  graduationYear?: number;
  itLevel?: string;
  foreignLanguageLevel?: string;
}

export interface StaffSalary {
  id?: number;
  staffProfileId: number;
  salaryCoefficient?: number;
  salaryLevel?: number;
  baseSalary?: number;
  salaryStartDate?: string;
  unionAllowancePercent?: number;
  seniorityAllowancePercent?: number;
  incentiveAllowancePercent?: number;
  positionAllowancePercent?: number;
  salaryNote?: string;
}

export interface StaffEvaluation {
  id?: number;
  staffProfileId: number;
  civilServantRating?: string;
  excellentTeacher?: boolean;
  evaluationYear?: number;
  note?: string;
}
