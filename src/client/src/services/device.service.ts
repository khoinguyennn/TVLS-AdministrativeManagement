import { api } from '@/lib/api';
import type { Device, CreateDeviceInput, UpdateDeviceInput } from '@/types/facility.types';

export const deviceService = {
  async getAll(): Promise<Device[]> {
    const response = await api.get<{ success: boolean; data: Device[]; message: string }>('/devices');
    return response.data.data;
  },

  async getById(id: number): Promise<Device> {
    const response = await api.get<{ success: boolean; data: Device; message: string }>(`/devices/${id}`);
    return response.data.data;
  },

  async getByRoom(roomId: number): Promise<Device[]> {
    const response = await api.get<{ success: boolean; data: Device[]; message: string }>(`/devices?roomId=${roomId}`);
    return response.data.data;
  },

  async create(data: CreateDeviceInput): Promise<Device> {
    const response = await api.post<{ success: boolean; data: Device; message: string }>('/devices', data);
    return response.data.data;
  },

  async update(id: number, data: UpdateDeviceInput): Promise<Device> {
    const response = await api.put<{ success: boolean; data: Device; message: string }>(`/devices/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/devices/${id}`);
  },
};
