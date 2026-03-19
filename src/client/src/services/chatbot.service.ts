import { api } from "@/lib/api";

export interface ChatbotResponse {
  success: boolean;
  data: {
    reply: string;
  };
  message: string;
}

export const chatbotService = {
  chat: async (message: string): Promise<ChatbotResponse> => {
    const response = await api.post<ChatbotResponse>("/chatbot/chat", { message });
    return response.data;
  }
};
