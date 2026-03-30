import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { DeviceReport } from '@interfaces/device-reports.interface';

export type DeviceReportCreationAttributes = Optional<
  DeviceReport,
  'id' | 'imageUrl' | 'assignedTo' | 'status' | 'technicianNote' | 'confirmedAt' | 'createdAt' | 'updatedAt'
>;

export class DeviceReportModel extends Model<DeviceReport, DeviceReportCreationAttributes> implements DeviceReport {
  public declare id: number;
  public declare reporterId: number;
  public declare deviceId: number;
  public declare description: string;
  public declare imageUrl: string;
  public declare assignedTo: number;
  public declare status: 'pending' | 'received' | 'repairing' | 'repaired' | 'waiting_replacement' | 'unfixable' | 'recheck_required' | 'completed';
  public declare technicianNote: string;
  public declare confirmedAt: Date;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

export default function (sequelize: Sequelize): typeof DeviceReportModel {
  DeviceReportModel.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      reporterId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'reporter_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      deviceId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'device_id',
        references: {
          model: 'devices',
          key: 'id',
        },
      },
      description: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      imageUrl: {
        allowNull: true,
        type: DataTypes.STRING(255),
        field: 'image_url',
      },
      assignedTo: {
        allowNull: true,
        type: DataTypes.INTEGER,
        field: 'assigned_to',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      status: {
        allowNull: true,
        type: DataTypes.ENUM('pending', 'received', 'repairing', 'repaired', 'waiting_replacement', 'unfixable', 'recheck_required', 'completed'),
        defaultValue: 'pending',
      },
      technicianNote: {
        allowNull: true,
        type: DataTypes.TEXT,
        field: 'technician_note',
      },
      confirmedAt: {
        allowNull: true,
        type: DataTypes.DATE,
        field: 'confirmed_at',
      },
    },
    {
      tableName: 'device_reports',
      sequelize,
    },
  );

  return DeviceReportModel;
}
