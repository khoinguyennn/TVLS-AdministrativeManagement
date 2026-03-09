import { api } from "@/lib/api";
import type {
  SignatureConfigResponse,
  SignatureImageResponse,
  SignaturePinResponse,
  SignatureVerifyResponse,
} from "@/types/digital-signature.types";

export const digitalSignatureService = {
  getConfig: async (): Promise<SignatureConfigResponse> => {
    const response = await api.get<SignatureConfigResponse>("/digital-signatures/config");
    return response.data;
  },

  uploadImage: async (file: File): Promise<SignatureImageResponse> => {
    const formData = new FormData();
    formData.append("signatureImage", file);
    const response = await api.post<SignatureImageResponse>("/digital-signatures/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  saveDrawn: async (dataUrl: string): Promise<SignatureImageResponse> => {
    const response = await api.post<SignatureImageResponse>("/digital-signatures/draw", { dataUrl });
    return response.data;
  },

  deleteImage: async (): Promise<SignaturePinResponse> => {
    const response = await api.delete<SignaturePinResponse>("/digital-signatures/image");
    return response.data;
  },

  setPin: async (pin: string): Promise<SignaturePinResponse> => {
    const response = await api.post<SignaturePinResponse>("/digital-signatures/pin/set", { pin });
    return response.data;
  },

  changePin: async (currentPin: string, newPin: string): Promise<SignaturePinResponse> => {
    const response = await api.put<SignaturePinResponse>("/digital-signatures/pin/change", {
      currentPin,
      newPin,
    });
    return response.data;
  },

  verifyPin: async (pin: string): Promise<SignatureVerifyResponse> => {
    const response = await api.post<SignatureVerifyResponse>("/digital-signatures/pin/verify", { pin });
    return response.data;
  },
};
