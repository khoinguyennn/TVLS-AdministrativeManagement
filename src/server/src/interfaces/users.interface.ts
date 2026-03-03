export interface User {
  id?: number;
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'manager' | 'staff';
  status: 'active' | 'inactive' | 'locked';
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
