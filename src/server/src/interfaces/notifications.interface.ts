export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'device_report' | 'leave_request' | 'work_order' | 'system';
  referenceId?: number;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
