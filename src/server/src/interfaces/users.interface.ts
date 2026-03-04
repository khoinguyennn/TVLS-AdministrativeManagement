export interface User {
  id?: number;
  email: string;
  password: string;
  fullName: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'teacher' | 'technician';
  status: 'active' | 'inactive' | 'locked';
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
