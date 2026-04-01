import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface WorkOrderAssignee {
  id: number;
  work_order_id: number;
  assigned_to_user_id: number;
  assigned_at: Date;
}

export type WorkOrderAssigneeCreationAttributes = Optional<WorkOrderAssignee, 'id' | 'assigned_at'>;

export class WorkOrderAssigneeModel extends Model<WorkOrderAssignee, WorkOrderAssigneeCreationAttributes> implements WorkOrderAssignee {
  public id: number;
  public work_order_id: number;
  public assigned_to_user_id: number;
  public readonly assigned_at!: Date;
}

export default function (sequelize: Sequelize): typeof WorkOrderAssigneeModel {
  WorkOrderAssigneeModel.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      work_order_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'work_order_id',
        references: { model: 'work_orders', key: 'id' },
      },
      assigned_to_user_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'assigned_to_user_id',
        references: { model: 'users', key: 'id' },
      },
      assigned_at: {
        allowNull: false,
        type: DataTypes.DATE,
        field: 'assigned_at',
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'work_order_assignees',
      sequelize,
      timestamps: false,
      indexes: [
        { unique: true, fields: ['work_order_id', 'assigned_to_user_id'] },
        { fields: ['assigned_to_user_id'] },
      ],
    },
  );

  return WorkOrderAssigneeModel;
}
