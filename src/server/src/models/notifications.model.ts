import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Notification } from '@interfaces/notifications.interface';

export type NotificationCreationAttributes = Optional<Notification, 'id' | 'isRead' | 'createdAt' | 'updatedAt'>;

export class NotificationModel extends Model<Notification, NotificationCreationAttributes> implements Notification {
  public declare id: number;
  public declare userId: number;
  public declare title: string;
  public declare message: string;
  public declare type: 'device_report' | 'leave_request' | 'work_order' | 'system';
  public referenceId?: number;
  public declare isRead: boolean;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
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
