// Building Types
export interface Building {
  id: number;
  name: string;
  description?: string;
}

export interface CreateBuildingInput {
  name: string;
  description?: string;
}

export interface UpdateBuildingInput extends Partial<CreateBuildingInput> {}

// Room Types
export interface Room {
  id: number;
  buildingId: number;
  name: string;
}

export interface CreateRoomInput {
  buildingId: number;
  name: string;
}

export interface UpdateRoomInput extends Partial<CreateRoomInput> {}

// Device Types
export interface Device {
  id: number;
  name: string;
  roomId?: number;
  status: 'active' | 'under_repair' | 'waiting_replacement' | 'broken';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDeviceInput {
  name: string;
  roomId?: number;
  status?: 'active' | 'under_repair' | 'waiting_replacement' | 'broken';
}

export interface UpdateDeviceInput extends Partial<CreateDeviceInput> {}

// Equipment Types (keeping for backward compatibility)
export interface Equipment {
  id: number;
  roomId: number;
  name: string;
  code: string;
  category: 'computer' | 'projector' | 'furniture' | 'lab-equipment' | 'other';
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  price?: number;
  status: 'working' | 'broken' | 'maintenance' | 'disposed';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEquipmentInput {
  roomId: number;
  name: string;
  code: string;
  category: 'computer' | 'projector' | 'furniture' | 'lab-equipment' | 'other';
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  price?: number;
  status?: 'working' | 'broken' | 'maintenance' | 'disposed';
  description?: string;
}

export interface UpdateEquipmentInput extends Partial<CreateEquipmentInput> {}
