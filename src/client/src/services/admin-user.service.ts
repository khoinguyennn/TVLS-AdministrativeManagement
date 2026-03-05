import { api } from "@/lib/api";
import type { User } from "@/types/auth.types";

// --- Request types ---
export interface CreateUserPayload {
  email: string;
  password: string;
  fullName: string;
  role?: User["role"];
}

export interface UpdateUserPayload {
  fullName?: string;
  password?: string;
  role?: User["role"];
  status?: User["status"];
}

// --- Response types ---
export interface UsersApiResponse {
  success: boolean;
  data: User[];
  message: string;
}

export interface UserApiResponse {
  success: boolean;
  data: User;
  message: string;
}

// --- Service ---
export const adminUserService = {
  getAll: async (): Promise<UsersApiResponse> => {
    const response = await api.get<UsersApiResponse>("/users");
    return response.data;
  },

  getById: async (id: number): Promise<UserApiResponse> => {
    const response = await api.get<UserApiResponse>(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserPayload): Promise<UserApiResponse> => {
    const response = await api.post<UserApiResponse>("/users", data);
    return response.data;
  },

  update: async (id: number, data: UpdateUserPayload): Promise<UserApiResponse> => {
    const response = await api.put<UserApiResponse>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<UserApiResponse> => {
    const response = await api.delete<UserApiResponse>(`/users/${id}`);
    return response.data;
  },
};
