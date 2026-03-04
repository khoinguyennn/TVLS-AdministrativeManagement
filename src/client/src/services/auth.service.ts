import { api } from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";
import type {
  ApiResponse,
  ForgotPasswordRequest,
  GoogleLoginRequest,
  LoginRequest,
  LoginResponse,
  ProfileResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ResetPasswordRequest,
  VerifyOTPRequest,
  VerifyOTPResponse
} from "@/types/auth.types";

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  googleLogin: async (data: GoogleLoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/google", data);
    return response.data;
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponse>("/auth/refresh", data);
    return response.data;
  },

  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get<ProfileResponse>("/auth/profile");
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } finally {
      authStorage.clearAll();
    }
  },

  // Password Reset
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>("/auth/forgot-password", data);
    return response.data;
  },

  verifyOTP: async (data: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
    const response = await api.post<VerifyOTPResponse>("/auth/verify-otp", data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>("/auth/reset-password", data);
    return response.data;
  }
};
