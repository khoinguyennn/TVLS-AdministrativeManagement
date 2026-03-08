export interface LeaveType {
  id?: number;
  name: string;
  maxDaysPerYear?: number;
}

export interface LeaveRequest {
  id?: number;
  userId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: number;
  rejectedReason?: string;
  signedAt?: Date;
  approverSignedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LeaveBalance {
  id?: number;
  userId: number;
  year: number;
  totalDays: number;
  usedDays: number;
}
