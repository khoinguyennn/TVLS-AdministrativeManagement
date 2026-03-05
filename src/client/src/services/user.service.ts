import { api } from "@/lib/api";
import type { User } from "@/types/auth.types";

export interface UpdateProfilePayload {
  email?: string;
  fullName?: string;
  avatar?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface ProfileApiResponse {
  success: boolean;
  data: User;
  message: string;
}

export const userService = {
  getProfile: async (): Promise<ProfileApiResponse> => {
    const response = await api.get<ProfileApiResponse>("/users/me");
    return response.data;
  },

  updateProfile: async (data: UpdateProfilePayload): Promise<ProfileApiResponse> => {
    const response = await api.put<ProfileApiResponse>("/users/me", data);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<ProfileApiResponse> => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await api.post<ProfileApiResponse>("/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  }
};
