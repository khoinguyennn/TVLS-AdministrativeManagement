import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Notification } from '@interfaces/notifications.interface';

export type NotificationCreationAttributes = Optional<Notification, 'id' | 'isRead' | 'createdAt' | 'updatedAt'>;

export class NotificationModel extends Model<Notification, NotificationCreationAttributes> implements Notification {
  public id: number;
  public userId: number;
  public title: string;
  public message: string;
  public type: 'device_report' | 'leave_request' | 'work_order' | 'system';
  public referenceId?: number;
  public isRead: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof NotificationModel {
  NotificationModel.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'user_id',
      },
      title: {
        allowNull: false,
        type: DataTypes.STRING(255),
      },
      message: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      type: {
        allowNull: false,
        type: DataTypes.ENUM('device_report', 'leave_request', 'work_order', 'system'),
        defaultValue: 'system',
      },
      referenceId: {
        allowNull: true,
        type: DataTypes.INTEGER,
        field: 'reference_id',
      },
      isRead: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_read',
      },
    },
    {
      tableName: 'notifications',
      sequelize,
    },
  );

  return NotificationModel;
}
