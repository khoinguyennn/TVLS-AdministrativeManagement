export interface WorkOrder {
  id: number;
  code: string; // Mã công lệnh
  title: string; // Tiêu đề công lệnh
  content: string; // Nội dung công việc
  location?: string; // Địa điểm thực hiện
  startDate?: string; // Thời gian bắt đầu (ISO string)
  endDate?: string; // Thời gian kết thúc (ISO string)
  note?: string; // Ghi chú
  createdBy: number; // ID người tạo
  approvedBy?: number; // ID người phê duyệt
  assignedTo?: number; // ID nhân viên được giao
  status: "pending" | "approved" | "in_progress" | "completed" | "rejected" | "cancelled";
  rejectionReason?: string; // Lý do từ chối
  createdAt: string;
  updatedAt: string;

  // Thông tin người tạo (join từ users)
  createdByUser?: {
    id: number;
    fullName: string;
    email: string;
  };

  // Thông tin người phê duyệt (join từ users)
  approvedByUser?: {
    id: number;
    fullName: string;
    email: string;
  };

  // Thông tin nhân viên được giao (join từ users)
  assignedToUser?: {
    id: number;
    fullName: string;
    email: string;
  };

  // File đính kèm (từ work_order_attachments)
  attachments?: Array<{
    id: number;
    fileUrl: string;
    uploadedBy: number;
    createdAt: string;
  }>;
}

export interface CreateWorkOrderPayload {
  title: string;
  content: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  note?: string;
  assignedTo?: number;
}

export interface UpdateWorkOrderPayload extends Partial<CreateWorkOrderPayload> {
  status?: WorkOrder["status"];
  approvedBy?: number;
}

export interface RequestReworkPayload {
  reason?: string;
}

export interface WorkOrderApiResponse {
  success: boolean;
  data: WorkOrder;
  message: string;
}

export interface WorkOrderListApiResponse {
  success: boolean;
  data: WorkOrder[];
  total: number;
  page: number;
  limit: number;
  message: string;
}