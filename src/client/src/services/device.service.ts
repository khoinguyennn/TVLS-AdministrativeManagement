import { api } from "@/lib/api";

export interface DeviceItem {
  id: number;
  name: string;
  roomId?: number;
  status: string;
}

export interface DevicesApiResponse {
  success: boolean;
  data: DeviceItem[];
  message: string;
}

export const deviceService = {
  getAll: async (): Promise<DevicesApiResponse> => {
    const response = await api.get<DevicesApiResponse>("/devices");
    return response.data;
  },
};
