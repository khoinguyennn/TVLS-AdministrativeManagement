import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Room } from '@interfaces/facility.interface';

export type RoomCreationAttributes = Optional<Room, 'id' | 'floor' | 'capacity' | 'area' | 'description' | 'createdAt' | 'updatedAt'>;

export class RoomModel extends Model<Room, RoomCreationAttributes> implements Room {
  public id: number;
  public buildingId: number;
  public name: string;
  public code: string;
  public floor: number;
  public capacity: number;
  public area: number;
  public type: 'classroom' | 'lab' | 'office' | 'meeting' | 'storage' | 'other';
  public status: 'available' | 'occupied' | 'maintenance' | 'unavailable';
  public description: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof RoomModel {
  RoomModel.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      buildingId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'building_id',
        references: {
          model: 'buildings',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      code: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING(50),
      },
      floor: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      capacity: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      area: {
        allowNull: true,
        type: DataTypes.DECIMAL(10, 2),
      },
      type: {
        allowNull: false,
        type: DataTypes.ENUM('classroom', 'lab', 'office', 'meeting', 'storage', 'other'),
        defaultValue: 'classroom',
      },
      status: {
        allowNull: false,
        type: DataTypes.ENUM('available', 'occupied', 'maintenance', 'unavailable'),
        defaultValue: 'available',
      },
      description: {
        allowNull: true,
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: 'rooms',
      sequelize,
    },
  );

  return RoomModel;
}
