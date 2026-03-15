import { api } from "@/lib/api";

export interface StaffStatistics {
  total: number;
  byGender: Record<string, number>;
  byStatus: Record<string, number>;
  byJobPosition: Record<string, number>;
  byContractType: Record<string, number>;
  bySubjectGroup: Record<string, number>;
  byEthnicity: Record<string, number>;
  byEducationLevel: Record<string, number>;
  byAgeGroup: Record<string, number>;
  ageByEducation: Array<{ ageGroup: string; [key: string]: string | number }>;
  byPositionGroup: Record<string, number>;
}

export interface StaffStatisticsResponse {
  success: boolean;
  data: StaffStatistics;
  message: string;
}

export const staffStatisticsService = {
  getStatistics: async (jobPosition?: string): Promise<StaffStatisticsResponse> => {
    const params = jobPosition ? { jobPosition } : {};
    const response = await api.get<StaffStatisticsResponse>("/staff/statistics", { params });
    return response.data;
  },
};
