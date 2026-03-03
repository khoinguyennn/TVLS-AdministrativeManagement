import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { User } from '@interfaces/users.interface';

export type UserCreationAttributes = Optional<User, 'id' | 'role' | 'status' | 'lastLoginAt' | 'createdAt' | 'updatedAt'>;

export class UserModel extends Model<User, UserCreationAttributes> implements User {
  public id: number;
  public email: string;
  public password: string;
  public fullName: string;
  public role: 'admin' | 'manager' | 'staff';
  public status: 'active' | 'inactive' | 'locked';
  public lastLoginAt: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof UserModel {
  UserModel.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      email: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING(100),
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING(255),
      },
      fullName: {
        allowNull: false,
        type: DataTypes.STRING(100),
        field: 'full_name',
      },
      role: {
        allowNull: false,
        type: DataTypes.ENUM('admin', 'manager', 'staff'),
        defaultValue: 'staff',
      },
      status: {
        allowNull: false,
        type: DataTypes.ENUM('active', 'inactive', 'locked'),
        defaultValue: 'active',
      },
      lastLoginAt: {
        allowNull: true,
        type: DataTypes.DATE,
        field: 'last_login_at',
      },
    },
    {
      tableName: 'users',
      sequelize,
    },
  );

  return UserModel;
}
