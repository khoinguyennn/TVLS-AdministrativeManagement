import { api } from "@/lib/api";
import type { WorkOrder, CreateWorkOrderPayload, UpdateWorkOrderPayload } from "@/types/work-order.types";

const ENDPOINT = "/work-orders";

export const workOrderService = {
  async getAll(params?: { status?: string; assignedTo?: number; createdBy?: number }): Promise<WorkOrder[]> {
    const res = await api.get<{ success: boolean; data: WorkOrder[]; message: string }>(ENDPOINT, { params });
    return res.data.data;
  },

  async getById(id: number): Promise<WorkOrder> {
    const res = await api.get<{ success: boolean; data: WorkOrder; message: string }>(`${ENDPOINT}/${id}`);
    return res.data.data;
  },

  async create(payload: CreateWorkOrderPayload): Promise<WorkOrder> {
    const res = await api.post<{ success: boolean; data: WorkOrder; message: string }>(ENDPOINT, payload);
    return res.data.data;
  },

  async update(id: number, payload: UpdateWorkOrderPayload): Promise<WorkOrder> {
    const res = await api.put<{ success: boolean; data: WorkOrder; message: string }>(`${ENDPOINT}/${id}`, payload);
    return res.data.data;
  },

  async approve(id: number): Promise<WorkOrder> {
    const res = await api.put<{ success: boolean; data: WorkOrder; message: string }>(`${ENDPOINT}/${id}/approve`);
    return res.data.data;
  },

  async reject(id: number): Promise<WorkOrder> {
    const res = await api.put<{ success: boolean; data: WorkOrder; message: string }>(`${ENDPOINT}/${id}/reject`);
    return res.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};
