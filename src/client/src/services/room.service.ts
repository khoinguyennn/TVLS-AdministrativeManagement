import { api } from '@/lib/api';
import type { Room, CreateRoomInput, UpdateRoomInput } from '@/types/facility.types';

export const roomService = {
  // Get all rooms
  getAll: async (buildingId?: number): Promise<Room[]> => {
    const url = buildingId ? `/rooms?buildingId=${buildingId}` : '/rooms';
    const response = await api.get<{ success: boolean; data: Room[]; message: string }>(url);
    return response.data.data;
  },

  // Get room by ID
  getById: async (id: number): Promise<Room> => {
    const response = await api.get<{ success: boolean; data: Room; message: string }>(`/rooms/${id}`);
    return response.data.data;
  },

  // Create new room
  create: async (data: CreateRoomInput): Promise<Room> => {
    const response = await api.post<{ success: boolean; data: Room; message: string }>('/rooms', data);
    return response.data.data;
  },

  // Update room
  update: async (id: number, data: UpdateRoomInput): Promise<Room> => {
    const response = await api.put<{ success: boolean; data: Room; message: string }>(`/rooms/${id}`, data);
    return response.data.data;
  },

  // Delete room
  delete: async (id: number): Promise<void> => {
    await api.delete(`/rooms/${id}`);
  },
};
