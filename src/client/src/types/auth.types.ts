export interface User {
  id: number;
  email: string;
  fullName: string;
  role: "admin" | "manager" | "staff";
  status?: "active" | "inactive" | "locked";
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  credential: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: Pick<User, "id" | "email" | "fullName" | "role">;
  };
  message: string;
}

export interface AuthError {
  success: boolean;
  status: number;
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
  };
  message: string;
}

export interface ProfileResponse {
  success: boolean;
  data: Omit<User, "status"> & { status: string };
  message: string;
}

// Password Reset
export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface VerifyOTPResponse extends ApiResponse {
  data?: {
    valid: boolean;
  };
}
