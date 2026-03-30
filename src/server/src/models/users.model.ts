import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { User } from '@interfaces/users.interface';

export type UserCreationAttributes = Optional<User, 'id' | 'role' | 'status' | 'avatar' | 'lastLoginAt' | 'createdAt' | 'updatedAt'>;

export class UserModel extends Model<User, UserCreationAttributes> implements User {
  public declare id: number;
  public declare email: string;
  public declare password: string;
  public declare fullName: string;
  public declare avatar: string;
  public declare role: 'admin' | 'manager' | 'teacher' | 'technician';
  public declare status: 'active' | 'inactive' | 'locked';
  public declare lastLoginAt: Date;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
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
      avatar: {
        allowNull: true,
        type: DataTypes.STRING(255),
      },
      role: {
        allowNull: false,
        type: DataTypes.ENUM('admin', 'manager', 'teacher', 'technician'),
        defaultValue: 'teacher',
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
