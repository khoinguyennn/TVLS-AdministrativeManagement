import { api } from '@/lib/api';
import type { Building, CreateBuildingInput, UpdateBuildingInput } from '@/types/facility.types';

export const buildingService = {
  // Get all buildings
  getAll: async (): Promise<Building[]> => {
    const response = await api.get<{ success: boolean; data: Building[]; message: string }>('/buildings');
    return response.data.data;
  },

  // Get building by ID
  getById: async (id: number): Promise<Building> => {
    const response = await api.get<{ success: boolean; data: Building; message: string }>(`/buildings/${id}`);
    return response.data.data;
  },

  // Create new building
  create: async (data: CreateBuildingInput): Promise<Building> => {
    const response = await api.post<{ success: boolean; data: Building; message: string }>('/buildings', data);
    return response.data.data;
  },

  // Update building
  update: async (id: number, data: UpdateBuildingInput): Promise<Building> => {
    const response = await api.put<{ success: boolean; data: Building; message: string }>(`/buildings/${id}`, data);
    return response.data.data;
  },

  // Delete building
  delete: async (id: number): Promise<void> => {
    await api.delete(`/buildings/${id}`);
  },
};
