import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { WorkOrder } from '@interfaces/work-orders.interface';

export type WorkOrderCreationAttributes = Optional<
  WorkOrder,
  'id' | 'location' | 'startDate' | 'endDate' | 'note' | 'approvedBy' | 'assignedTo' | 'status' | 'createdAt' | 'updatedAt'
>;

export class WorkOrderModel extends Model<WorkOrder, WorkOrderCreationAttributes> implements WorkOrder {
  public id: number;
  public code: string;
  public title: string;
  public content: string;
  public location: string;
  public startDate: Date;
  public endDate: Date;
  public note: string;
  public createdBy: number;
  public approvedBy: number;
  public assignedTo: number;
  public status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof WorkOrderModel {
  WorkOrderModel.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      code: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING(50),
      },
      title: {
        allowNull: false,
        type: DataTypes.STRING(255),
      },
      content: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      location: {
        allowNull: true,
        type: DataTypes.STRING(255),
      },
      startDate: {
        allowNull: true,
        type: DataTypes.DATE,
        field: 'start_date',
      },
      endDate: {
        allowNull: true,
        type: DataTypes.DATE,
        field: 'end_date',
      },
      note: {
        allowNull: true,
        type: DataTypes.TEXT,
      },
      createdBy: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'created_by',
        references: { model: 'users', key: 'id' },
      },
      approvedBy: {
        allowNull: true,
        type: DataTypes.INTEGER,
        field: 'approved_by',
        references: { model: 'users', key: 'id' },
      },
      assignedTo: {
        allowNull: true,
        type: DataTypes.INTEGER,
        field: 'assigned_to',
        references: { model: 'users', key: 'id' },
      },
      status: {
        allowNull: true,
        type: DataTypes.ENUM('pending', 'approved', 'in_progress', 'completed', 'rejected', 'cancelled'),
        defaultValue: 'pending',
      },
    },
    {
      tableName: 'work_orders',
      sequelize,
    },
  );

  return WorkOrderModel;
}
