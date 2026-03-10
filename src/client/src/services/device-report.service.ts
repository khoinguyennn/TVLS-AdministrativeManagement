import type { DeviceReport, DeviceReportStats } from "@/types/device-report.types";

import { api } from "@/lib/api";

// --- Request types ---
export interface CreateDeviceReportPayload {
  deviceId: number;
  description: string;
  image?: File;
}

export interface UpdateDeviceReportPayload {
  description?: string;
  image?: File;
  assignedTo?: number;
  status?: DeviceReport["status"];
  technicianNote?: string;
}

// --- Response types ---
export interface DeviceReportsApiResponse {
  success: boolean;
  data: DeviceReport[];
  message: string;
}

export interface DeviceReportApiResponse {
  success: boolean;
  data: DeviceReport;
  message: string;
}

export interface DeviceReportStatsApiResponse {
  success: boolean;
  data: DeviceReportStats;
  message: string;
}

// --- Service ---
export const deviceReportService = {
  getAll: async (): Promise<DeviceReportsApiResponse> => {
    const response = await api.get<DeviceReportsApiResponse>("/device-reports");
    return response.data;
  },

  getById: async (id: number): Promise<DeviceReportApiResponse> => {
    const response = await api.get<DeviceReportApiResponse>(`/device-reports/${id}`);
    return response.data;
  },

  create: async (data: CreateDeviceReportPayload): Promise<DeviceReportApiResponse> => {
    const formData = new FormData();
    formData.append("deviceId", String(data.deviceId));
    formData.append("description", data.description);
    if (data.image) {
      formData.append("image", data.image);
    }
    const response = await api.post<DeviceReportApiResponse>("/device-reports", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  },

  update: async (id: number, data: UpdateDeviceReportPayload): Promise<DeviceReportApiResponse> => {
    const formData = new FormData();
    if (data.description !== undefined) formData.append("description", data.description);
    if (data.image) formData.append("image", data.image);
    if (data.assignedTo !== undefined) formData.append("assignedTo", String(data.assignedTo));
    if (data.status !== undefined) formData.append("status", data.status);
    if (data.technicianNote !== undefined) formData.append("technicianNote", data.technicianNote);
    const response = await api.put<DeviceReportApiResponse>(`/device-reports/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  },

  delete: async (id: number): Promise<DeviceReportApiResponse> => {
    const response = await api.delete<DeviceReportApiResponse>(`/device-reports/${id}`);
    return response.data;
  },

  getStats: async (): Promise<DeviceReportStatsApiResponse> => {
    const response = await api.get<DeviceReportStatsApiResponse>("/device-reports/stats");
    return response.data;
  },

  // ── Workflow ──

  receive: async (id: number): Promise<DeviceReportApiResponse> => {
    const response = await api.put<DeviceReportApiResponse>(`/device-reports/${id}/receive`);
    return response.data;
  },

  updateResult: async (
    id: number,
    status: string,
    technicianNote?: string
  ): Promise<DeviceReportApiResponse> => {
    const response = await api.put<DeviceReportApiResponse>(`/device-reports/${id}/result`, {
      status,
      technicianNote
    });
    return response.data;
  },

  confirm: async (
    id: number,
    isWorking: boolean,
    description?: string
  ): Promise<DeviceReportApiResponse> => {
    const response = await api.put<DeviceReportApiResponse>(`/device-reports/${id}/confirm`, {
      isWorking,
      description
    });
    return response.data;
  }
};
