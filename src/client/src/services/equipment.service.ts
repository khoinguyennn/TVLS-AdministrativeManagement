import { api } from '@/lib/api';
import type { Equipment, CreateEquipmentInput, UpdateEquipmentInput } from '@/types/facility.types';

export const equipmentService = {
  // Get all equipment
  getAll: async (roomId?: number): Promise<Equipment[]> => {
    const url = roomId ? `/equipment?roomId=${roomId}` : '/equipment';
    const response = await api.get<{ success: boolean; data: Equipment[]; message: string }>(url);
    return response.data.data;
  },

  // Get equipment by ID
  getById: async (id: number): Promise<Equipment> => {
    const response = await api.get<{ success: boolean; data: Equipment; message: string }>(`/equipment/${id}`);
    return response.data.data;
  },

  // Create new equipment
  create: async (data: CreateEquipmentInput): Promise<Equipment> => {
    const response = await api.post<{ success: boolean; data: Equipment; message: string }>('/equipment', data);
    return response.data.data;
  },

  // Update equipment
  update: async (id: number, data: UpdateEquipmentInput): Promise<Equipment> => {
    const response = await api.put<{ success: boolean; data: Equipment; message: string }>(`/equipment/${id}`, data);
    return response.data.data;
  },

  // Delete equipment
  delete: async (id: number): Promise<void> => {
    await api.delete(`/equipment/${id}`);
  },
};
