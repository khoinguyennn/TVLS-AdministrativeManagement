import { api } from "@/lib/api";
import type {
  WorkOrder,
  CreateWorkOrderPayload,
  UpdateWorkOrderPayload,
  RequestReworkPayload,
} from "@/types/work-order.types";

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

  async exportPdf(id: number): Promise<Blob> {
    const res = await api.get(`${ENDPOINT}/${id}/pdf`, {
      responseType: 'blob',
    });
    return res.data as Blob;
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

  async uploadEvidence(id: number, file: File): Promise<WorkOrder> {
    const formData = new FormData();
    formData.append("evidence", file);

    const res = await api.post<{ success: boolean; data: WorkOrder; message: string }>(`${ENDPOINT}/${id}/evidence`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.data;
  },

  async submitCompletion(id: number): Promise<WorkOrder> {
    const res = await api.put<{ success: boolean; data: WorkOrder; message: string }>(`${ENDPOINT}/${id}/submit-completion`);
    return res.data.data;
  },

  async confirmCompletion(id: number): Promise<WorkOrder> {
    const res = await api.put<{ success: boolean; data: WorkOrder; message: string }>(`${ENDPOINT}/${id}/confirm-completion`);
    return res.data.data;
  },

  async requestRework(id: number, payload?: RequestReworkPayload): Promise<WorkOrder> {
    const res = await api.put<{ success: boolean; data: WorkOrder; message: string }>(`${ENDPOINT}/${id}/request-rework`, payload ?? {});
    return res.data.data;
  },

  async resubmitForRework(id: number): Promise<WorkOrder> {
    const res = await api.put<{ success: boolean; data: WorkOrder; message: string }>(`${ENDPOINT}/${id}/resubmit-for-rework`);
    return res.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};
