export interface PersonnelRecord {
  id: number;
  userId: number;
  code: string; // staff_code
  fullName: string; // từ users.full_name
  email: string; // từ users.email
  role: string; // từ users.role
  status: "active" | "inactive" | "locked"; // từ users.status
  avatar?: string; // từ users.avatar

  // Từ staff_profiles
  gender: "Nam" | "Nữ" | "Khác";
  dateOfBirth?: string;
  cccdNumber?: string;
  cccdIssueDate?: string;
  cccdIssuePlace?: string;
  ethnicity?: string;
  religion?: string;
  staffStatus: "working" | "probation" | "maternity_leave" | "retired" | "resigned";
  recruitmentDate?: string;
  createdAt: string;
  updatedAt: string;

  // Địa chỉ liên hệ (từ staff_addresses where address_type = 'contact')
  contactAddress?: {
    province?: string;
    ward?: string;
    hamlet?: string;
    detailAddress?: string;
    phone?: string;
  };

  // Địa chỉ quê quán (từ staff_addresses where address_type = 'hometown')
  hometownAddress?: {
    province?: string;
    ward?: string;
    hamlet?: string;
    detailAddress?: string;
  };

  // Tài khoản ngân hàng (từ staff_bank_accounts)
  bankAccounts?: Array<{
    bankName?: string;
    branch?: string;
    accountNumber?: string;
  }>;

  // Đánh giá (từ staff_evaluations)
  evaluations?: Array<{
    civilServantRating?: string;
    excellentTeacher: boolean;
    evaluationYear?: number;
    note?: string;
  }>;

  // Tổ chức (từ staff_organizations)
  organizations?: {
    isUnionMember: boolean;
    unionJoinDate?: string;
    isPartyMember: boolean;
    partyJoinDate?: string;
  };

  // Vị trí công việc (từ staff_positions)
  positions?: Array<{
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

  // Trình độ (từ staff_qualifications)
  qualifications?: Array<{
    generalEducationLevel?: string;
    professionalLevel?: string;
    major?: string;
    trainingPlace?: string;
    graduationYear?: number;
    itLevel?: string;
    foreignLanguageLevel?: string;
  }>;

  // Lương (từ staff_salaries)
  salaries?: Array<{
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
}

export interface CreatePersonnelPayload {
  // User info
  email: string;
  fullName: string;
  role: "admin" | "manager" | "teacher" | "technician";
  status?: "active" | "inactive" | "locked";
  avatar?: string;

  // Staff profile
  staffCode: string;
  gender: "Nam" | "Nữ" | "Khác";
  dateOfBirth?: string;
  cccdNumber?: string;
  cccdIssueDate?: string;
  cccdIssuePlace?: string;
  ethnicity?: string;
  religion?: string;
  staffStatus?: "working" | "probation" | "maternity_leave" | "retired" | "resigned";
  recruitmentDate?: string;

  // Addresses
  contactAddress?: {
    province?: string;
    ward?: string;
    hamlet?: string;
    detailAddress?: string;
    phone?: string;
  };
  hometownAddress?: {
    province?: string;
    ward?: string;
    hamlet?: string;
    detailAddress?: string;
  };

  // Bank accounts
  bankAccounts?: Array<{
    bankName?: string;
    branch?: string;
    accountNumber?: string;
  }>;

  // Organizations
  organizations?: {
    isUnionMember?: boolean;
    unionJoinDate?: string;
    isPartyMember?: boolean;
    partyJoinDate?: string;
  };

  // Positions
  positions?: Array<{
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

  // Qualifications
  qualifications?: Array<{
    generalEducationLevel?: string;
    professionalLevel?: string;
    major?: string;
    trainingPlace?: string;
    graduationYear?: number;
    itLevel?: string;
    foreignLanguageLevel?: string;
  }>;

  // Salaries
  salaries?: Array<{
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
}

export interface UpdatePersonnelPayload
  extends Partial<CreatePersonnelPayload> {}

export interface PersonnelApiResponse {
  success: boolean;
  data: PersonnelRecord;
  message: string;
}

export interface PersonnelListApiResponse {
  success: boolean;
  data: PersonnelRecord[];
  message: string;
}

export interface PersonnelImportResponse {
  success: boolean;
  data: {
    importedCount: number;
    errors: Array<{ row: number; message: string }>;
  };
  message: string;
}
