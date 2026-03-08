export interface SignatureConfig {
  userId: number;
  signatureImage: string | null;
  hasPin: boolean;
}

export interface SignatureConfigResponse {
  success: boolean;
  data: SignatureConfig;
  message: string;
}

export interface SignatureImageResponse {
  success: boolean;
  data: { signatureImage: string };
  message: string;
}

export interface SignaturePinResponse {
  success: boolean;
  data: { message: string };
  message: string;
}

export interface SignatureVerifyResponse {
  success: boolean;
  data: { valid: boolean };
  message: string;
}
