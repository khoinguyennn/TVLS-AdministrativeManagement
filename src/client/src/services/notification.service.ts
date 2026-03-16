import { api } from "@/lib/api";

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: "device_report" | "leave_request" | "work_order" | "system";
  referenceId?: number;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get("/notifications");
    return response.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get("/notifications/unread-count");
    return response.data.data.count;
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put("/notifications/mark-all-read");
  },
};
