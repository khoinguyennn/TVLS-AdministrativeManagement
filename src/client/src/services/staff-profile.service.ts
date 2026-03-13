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
  staffStatus?: string;
  recruitmentDate?: string;
  createdAt?: string;
  updatedAt?: string;

  // Singular associations (hasOne)
  position?: {
    id?: number;
    jobPosition?: string;
    positionGroup?: string;
    recruitmentAgency?: string;
    professionWhenRecruited?: string;
    rankLevel?: string;
    educationLevel?: string;
    rankCode?: string;
    subjectGroup?: string;
    contractType?: string;
  };
  qualification?: {
    id?: number;
    generalEducationLevel?: string;
    professionalLevel?: string;
    major?: string;
    trainingPlace?: string;
    graduationYear?: number;
    itLevel?: string;
    foreignLanguageLevel?: string;
  };
  bankAccount?: {
    id?: number;
    bankName?: string;
    branch?: string;
    accountNumber?: string;
  };
  evaluation?: {
    id?: number;
    civilServantRating?: string;
    excellentTeacher?: boolean;
    evaluationYear?: number;
    note?: string;
  };
  organization?: {
    id?: number;
    isUnionMember?: boolean;
    unionJoinDate?: string;
    isPartyMember?: boolean;
    partyJoinDate?: string;
  };
  salary?: {
    id?: number;
    salaryCoefficient?: number;
    salaryLevel?: number;
    baseSalary?: number;
    salaryStartDate?: string;
    unionAllowancePercent?: number;
    seniorityAllowancePercent?: number;
    incentiveAllowancePercent?: number;
    positionAllowancePercent?: number;
    salaryNote?: string;
  };

  // Addresses remain as array
  addresses?: Array<{
    id?: number;
    addressType: "contact" | "hometown";
    province?: string;
    ward?: string;
    hamlet?: string;
    detailAddress?: string;
    phone?: string;
  }>;

  // User info (included from backend)
  user?: {
    id: number;
    fullName?: string;
    email?: string;
    role?: string;
    status?: string;
    avatar?: string;
  };
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
  addresses?: Array<{
    addressType: string;
    province?: string;
    ward?: string;
    hamlet?: string;
    detailAddress?: string;
    phone?: string;
  }>;
  organization?: {
    isUnionMember?: boolean;
    unionJoinDate?: string;
    isPartyMember?: boolean;
    partyJoinDate?: string;
  };
  position?: {
    jobPosition?: string;
    positionGroup?: string;
    recruitmentAgency?: string;
    professionWhenRecruited?: string;
    rankLevel?: string;
    educationLevel?: string;
    rankCode?: string;
    subjectGroup?: string;
    contractType?: string;
  };
  qualification?: {
    generalEducationLevel?: string;
    professionalLevel?: string;
    major?: string;
    trainingPlace?: string;
    graduationYear?: number;
    itLevel?: string;
    foreignLanguageLevel?: string;
  };
  bankAccount?: {
    bankName?: string;
    branch?: string;
    accountNumber?: string;
  };
  salary?: {
    salaryCoefficient?: number;
    salaryLevel?: number;
    baseSalary?: number;
    salaryStartDate?: string;
    unionAllowancePercent?: number;
    seniorityAllowancePercent?: number;
    incentiveAllowancePercent?: number;
    positionAllowancePercent?: number;
    salaryNote?: string;
  };
  evaluation?: {
    civilServantRating?: string;
    excellentTeacher?: boolean;
    evaluationYear?: number;
    note?: string;
  };
}

export interface StaffProfileApiResponse {
  success: boolean;
  data: StaffProfileData | null;
  message: string;
}

export const staffProfileService = {
  getMyProfile: async (userId: number): Promise<StaffProfileApiResponse> => {
    const response = await api.get<StaffProfileApiResponse>(`/staff/user/${userId}`);
    return response.data;
  },

  updateMyProfile: async (profileId: number, data: UpdateStaffProfilePayload): Promise<StaffProfileApiResponse> => {
    const response = await api.put<StaffProfileApiResponse>(`/staff/${profileId}`, data);
    return response.data;
  },
};
