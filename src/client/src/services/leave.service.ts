import { api } from "@/lib/api";
import type { LeaveRequest, LeaveType, LeaveBalance, LeaveRequestStats } from "@/types/leave.types";

// --- Request types ---
export interface CreateLeaveRequestPayload {
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
}

// --- Response types ---
export interface LeaveRequestsApiResponse {
  success: boolean;
  data: LeaveRequest[];
  message: string;
}

export interface LeaveRequestApiResponse {
  success: boolean;
  data: LeaveRequest;
  message: string;
}

export interface LeaveTypesApiResponse {
  success: boolean;
  data: LeaveType[];
  message: string;
}

export interface LeaveBalanceApiResponse {
  success: boolean;
  data: LeaveBalance;
  message: string;
}

export interface LeaveStatsApiResponse {
  success: boolean;
  data: LeaveRequestStats;
  message: string;
}

// --- Service ---
export const leaveRequestService = {
  getAll: async (): Promise<LeaveRequestsApiResponse> => {
    const response = await api.get<LeaveRequestsApiResponse>("/leave-requests");
    return response.data;
  },

  getById: async (id: number): Promise<LeaveRequestApiResponse> => {
    const response = await api.get<LeaveRequestApiResponse>(`/leave-requests/${id}`);
    return response.data;
  },

  create: async (data: CreateLeaveRequestPayload): Promise<LeaveRequestApiResponse> => {
    const response = await api.post<LeaveRequestApiResponse>("/leave-requests", data);
    return response.data;
  },

  approve: async (id: number): Promise<LeaveRequestApiResponse> => {
    const response = await api.put<LeaveRequestApiResponse>(`/leave-requests/${id}/approve`);
    return response.data;
  },

  reject: async (id: number, rejectedReason?: string): Promise<LeaveRequestApiResponse> => {
    const response = await api.put<LeaveRequestApiResponse>(`/leave-requests/${id}/reject`, { rejectedReason });
    return response.data;
  },

  delete: async (id: number): Promise<LeaveRequestApiResponse> => {
    const response = await api.delete<LeaveRequestApiResponse>(`/leave-requests/${id}`);
    return response.data;
  },

  getStats: async (): Promise<LeaveStatsApiResponse> => {
    const response = await api.get<LeaveStatsApiResponse>("/leave-requests/stats");
    return response.data;
  },

  // Leave Types
  getLeaveTypes: async (): Promise<LeaveTypesApiResponse> => {
    const response = await api.get<LeaveTypesApiResponse>("/leave-types");
    return response.data;
  },

  // Leave Balances
  getBalance: async (userId: number, year: number): Promise<LeaveBalanceApiResponse> => {
    const response = await api.get<LeaveBalanceApiResponse>(`/leave-balances/${userId}/${year}`);
    return response.data;
  },
};
