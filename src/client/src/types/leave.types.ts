export interface LeaveType {
  id: number;
  name: string;
  maxDaysPerYear?: number;
}

export interface LeaveRequest {
  id: number;
  userId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: number;
  rejectedReason?: string;
  signedAt?: string;
  approverSignedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: { id: number; fullName: string; avatar?: string; role: string };
  leaveType?: { id: number; name: string; maxDaysPerYear?: number };
  approver?: { id: number; fullName: string };
}

export interface LeaveBalance {
  userId: number;
  year: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

export interface LeaveRequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}
