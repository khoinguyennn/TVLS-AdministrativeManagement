// Building Interface
export interface Building {
  id?: number;
  code: string;
  name: string;
  floors?: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Room Interface
export interface Room {
  id?: number;
  buildingId: number;
  name: string;
  code: string;
  floor?: number;
  capacity?: number;
  area?: number;
  type: 'classroom' | 'lab' | 'office' | 'meeting' | 'storage' | 'other';
  status: 'available' | 'occupied' | 'maintenance' | 'unavailable';
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Equipment Interface
export interface Equipment {
  id?: number;
  roomId: number;
  name: string;
  code: string;
  category: 'computer' | 'projector' | 'furniture' | 'lab-equipment' | 'other';
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  price?: number;
  status: 'working' | 'broken' | 'maintenance' | 'disposed';
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
