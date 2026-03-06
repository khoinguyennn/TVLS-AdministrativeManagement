// Building Types
export interface Building {
  id: number;
  code: string;
  name: string;
  floors?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBuildingInput {
  code: string;
  name: string;
  floors?: number;
  description?: string;
}

export interface UpdateBuildingInput extends Partial<CreateBuildingInput> {}

// Room Types
export interface Room {
  id: number;
  buildingId: number;
  name: string;
  code: string;
  floor?: number;
  capacity?: number;
  area?: number;
  type: 'classroom' | 'lab' | 'office' | 'meeting' | 'storage' | 'other';
  status: 'available' | 'occupied' | 'maintenance' | 'unavailable';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomInput {
  buildingId: number;
  name: string;
  code: string;
  floor?: number;
  capacity?: number;
  area?: number;
  type: 'classroom' | 'lab' | 'office' | 'meeting' | 'storage' | 'other';
  status?: 'available' | 'occupied' | 'maintenance' | 'unavailable';
  description?: string;
}

export interface UpdateRoomInput extends Partial<CreateRoomInput> {}

// Equipment Types
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
