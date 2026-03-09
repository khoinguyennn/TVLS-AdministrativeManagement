import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Device } from '@interfaces/device-reports.interface';

export type DeviceCreationAttributes = Optional<Device, 'id' | 'roomId' | 'status' | 'createdAt' | 'updatedAt'>;

export class DeviceModel extends Model<Device, DeviceCreationAttributes> implements Device {
  public id: number;
  public name: string;
  public roomId: number;
  public status: 'active' | 'under_repair' | 'waiting_replacement' | 'broken';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
      },
      status: {
        allowNull: true,
        type: DataTypes.ENUM('active', 'under_repair', 'waiting_replacement', 'broken'),
        defaultValue: 'active',
      },
    },
    {
      tableName: 'devices',
      sequelize,
    },
  );

  return DeviceModel;
}
