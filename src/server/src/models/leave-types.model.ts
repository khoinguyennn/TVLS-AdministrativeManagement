import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { LeaveType } from '@interfaces/leave.interface';

export type LeaveTypeCreationAttributes = Optional<LeaveType, 'id' | 'maxDaysPerYear'>;

export class LeaveTypeModel extends Model<LeaveType, LeaveTypeCreationAttributes> implements LeaveType {
  public id: number;
  public name: string;
  public maxDaysPerYear: number;
}

export default function (sequelize: Sequelize): typeof LeaveTypeModel {
  LeaveTypeModel.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      maxDaysPerYear: {
        allowNull: true,
        type: DataTypes.INTEGER,
        field: 'max_days_per_year',
      },
    },
    {
      tableName: 'leave_types',
      sequelize,
      timestamps: false,
    },
  );

  return LeaveTypeModel;
}
