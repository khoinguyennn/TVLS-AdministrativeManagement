import { api } from "@/lib/api";

export interface StaffProfileData {
  id: number;
  userId: number;
  staffCode: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  cccdNumber?: string;
  cccdIssueDate?: string;
  cccdIssuePlace?: string;
  ethnicity?: string;
  religion?: string;
  staffStatus?: "working" | "resigned" | "transferred" | "maternity_leave" | "unpaid_leave";
  recruitmentDate?: string;
  createdAt?: string;
  updatedAt?: string;
  contactAddress?: {
    id?: number;
    province?: string;
    ward?: string;
    hamlet?: string;
    detailAddress?: string;
    phone?: string;
  };
  hometownAddress?: {
    id?: number;
    province?: string;
    ward?: string;
    hamlet?: string;
    detailAddress?: string;
  };
  organizations?: {
    isUnionMember?: boolean;
    unionJoinDate?: string;
    isPartyMember?: boolean;
    partyJoinDate?: string;
  };
  bankAccounts?: Array<{
    bankName?: string;
    branch?: string;
    accountNumber?: string;
  }>;
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
  qualifications?: Array<{
    generalEducationLevel?: string;
    professionalLevel?: string;
    major?: string;
    trainingPlace?: string;
    graduationYear?: number;
    itLevel?: string;
    foreignLanguageLevel?: string;
  }>;
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
  evaluations?: Array<{
    civilServantRating?: string;
    excellentTeacher?: boolean;
    evaluationYear?: number;
    note?: string;
  }>;
}

export interface UpdateStaffProfilePayload {
  staffCode?: string;
  gender?: string;
  dateOfBirth?: string;
  cccdNumber?: string;
  cccdIssueDate?: string;
  cccdIssuePlace?: string;
  ethnicity?: string;
  religion?: string;
  staffStatus?: string;
  recruitmentDate?: string;
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
  organizations?: {
    isUnionMember?: boolean;
    unionJoinDate?: string;
    isPartyMember?: boolean;
    partyJoinDate?: string;
  };
  bankAccounts?: Array<{
    bankName?: string;
    branch?: string;
    accountNumber?: string;
  }>;
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
  qualifications?: Array<{
    generalEducationLevel?: string;
    professionalLevel?: string;
    major?: string;
    trainingPlace?: string;
    graduationYear?: number;
    itLevel?: string;
    foreignLanguageLevel?: string;
  }>;
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
  evaluations?: Array<{
    civilServantRating?: string;
    excellentTeacher?: boolean;
    evaluationYear?: number;
    note?: string;
  }>;
}

export interface StaffProfileApiResponse {
  success: boolean;
  data: StaffProfileData | null;
  message: string;
}

export const staffProfileService = {
  getMyProfile: async (): Promise<StaffProfileApiResponse> => {
    const response = await api.get<StaffProfileApiResponse>("/staff-profiles/me");
    return response.data;
  },

  updateMyProfile: async (data: UpdateStaffProfilePayload): Promise<StaffProfileApiResponse> => {
    const response = await api.put<StaffProfileApiResponse>("/staff-profiles/me", data);
    return response.data;
  },
};
