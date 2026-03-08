import { api } from "@/lib/api";
import type {
  PersonnelRecord,
  CreatePersonnelPayload,
  UpdatePersonnelPayload
} from "@/types/personnel.types";

const ENDPOINT = "/personnel";

export const personnelService = {
  // Get all personnel
  async getAll() {
    const response = await api.get<{
      success: boolean;
      data: PersonnelRecord[];
      message: string;
    }>(`${ENDPOINT}`);
    return response;
  },

  // Get personnel by ID
  async getById(id: number) {
    const response = await api.get<{
      success: boolean;
      data: PersonnelRecord;
      message: string;
    }>(`${ENDPOINT}/${id}`);
    return response;
  },

  // Create new personnel
  async create(payload: CreatePersonnelPayload) {
    const response = await api.post<{
      success: boolean;
      data: PersonnelRecord;
      message: string;
    }>(`${ENDPOINT}`, payload);
    return response;
  },

  // Update personnel
  async update(id: number, payload: UpdatePersonnelPayload) {
    const response = await api.put<{
      success: boolean;
      data: PersonnelRecord;
      message: string;
    }>(`${ENDPOINT}/${id}`, payload);
    return response;
  },

  // Delete personnel
  async delete(id: number) {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`${ENDPOINT}/${id}`);
    return response;
  },

  // Import from Excel
  async importExcel(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<{
      success: boolean;
      data: {
        importedCount: number;
        errors: Array<{ row: number; message: string }>;
      };
      message: string;
    }>(`${ENDPOINT}/import`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response;
  },

  // Export to Excel
  async exportExcel() {
    const response = await api.get(`${ENDPOINT}/export`, {
      responseType: "blob"
    });
    return response;
  }
};
