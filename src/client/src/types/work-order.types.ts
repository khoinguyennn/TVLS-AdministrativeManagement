export interface WorkOrder {
  id: number;
  code: string; // Mã công lệnh tự động
  workLocation: string; // Nơi công tác
  workContent: string; // Nội dung công việc
  startTime: string; // Thời gian bắt đầu (yyyy-MM-dd HH:mm)
  endTime: string; // Thời gian kết thúc (yyyy-MM-dd HH:mm)
  notes?: string; // Ghi chú
  status: "pending" | "approved" | "in_progress" | "completed" | "rejected"; // Trạng thái
  assignedTo: number; // ID nhân viên được giao
  assignedBy: number; // ID người tạo/giao việc
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  evidencePhotos?: string[]; // Ảnh minh chứng hoàn thành
  rejectionReason?: string; // Lý do từ chối (nếu có)
}

export interface CreateWorkOrderPayload {
  workLocation: string;
  workContent: string;
  startTime: string;
  endTime: string;
  notes?: string;
  assignedTo: number;
}

export interface UpdateWorkOrderPayload extends Partial<CreateWorkOrderPayload> {
  status?: WorkOrder["status"];
  evidencePhotos?: string[];
  rejectionReason?: string;
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