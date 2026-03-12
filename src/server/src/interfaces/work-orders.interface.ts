export interface WorkOrder {
  id?: number;
  code: string;
  title: string;
  content: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  note?: string;
  createdBy: number;
  approvedBy?: number;
  assignedTo?: number;
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkOrderAttachment {
  id?: number;
  workOrderId: number;
  fileUrl: string;
  uploadedBy: number;
  createdAt?: Date;
}
