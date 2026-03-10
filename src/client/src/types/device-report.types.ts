export interface DeviceReport {
  id: number;
  reporterId: number;
  deviceId: number;
  description: string;
  imageUrl?: string;
  assignedTo?: number;
  status: "pending" | "received" | "repairing" | "repaired" | "waiting_replacement" | "unfixable" | "recheck_required" | "completed";
  technicianNote?: string;
  confirmedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  // Included relations
  reporter?: { id: number; fullName: string; avatar?: string };
  device?: {
    id: number;
    name: string;
    roomId?: number;
    status: string;
    room?: {
      id: number;
      name: string;
      buildingId: number;
      building?: { id: number; name: string };
    };
  };
  assignee?: { id: number; fullName: string; avatar?: string };
}

export interface DeviceReportStats {
  total: number;
  pending: number;
  repairing: number;
  completed: number;
}
