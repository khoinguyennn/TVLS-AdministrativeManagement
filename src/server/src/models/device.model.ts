import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Device } from '@interfaces/facility.interface';

export type DeviceCreationAttributes = Optional<Device, 'id' | 'createdAt' | 'updatedAt'>;

export class DeviceModel extends Model<Device, DeviceCreationAttributes> implements Device {
  public declare id: number;
  public declare name: string;
  public roomId?: number;
  public declare status: 'active' | 'under_repair' | 'waiting_replacement' | 'broken';

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

export default function (sequelize: Sequelize): typeof DeviceModel {
  DeviceModel.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING(255),
      },
      roomId: {
        allowNull: true,
        type: DataTypes.INTEGER,
        field: 'room_id',
        references: {
          model: 'rooms',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      status: {
        allowNull: false,
        type: DataTypes.ENUM('active', 'under_repair', 'waiting_replacement', 'broken'),
        defaultValue: 'active',
      },
    },
    {
      tableName: 'devices',
      sequelize,
      timestamps: true,
      underscored: true,
    },
  );

  return DeviceModel;
}
