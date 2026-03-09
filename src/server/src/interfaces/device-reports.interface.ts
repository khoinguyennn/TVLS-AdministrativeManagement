export interface DeviceReport {
  id?: number;
  reporterId: number;
  deviceId: number;
  description: string;
  imageUrl?: string;
  assignedTo?: number;
  status: 'pending' | 'received' | 'repairing' | 'repaired' | 'waiting_replacement' | 'unfixable' | 'recheck_required' | 'completed';
  technicianNote?: string;
  confirmedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Device {
  id?: number;
  name: string;
  roomId?: number;
  status: 'active' | 'under_repair' | 'waiting_replacement' | 'broken';
  createdAt?: Date;
  updatedAt?: Date;
}
