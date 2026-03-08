// Building Interface
export interface Building {
  id?: number;
  name: string;
  description?: string;
}

// Room Interface
export interface Room {
  id?: number;
  buildingId: number;
  name: string;
}

// Device Interface
export interface Device {
  id?: number;
  name: string;
  roomId?: number;
  status: 'active' | 'under_repair' | 'waiting_replacement' | 'broken';
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
