import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { LeaveBalance } from '@interfaces/leave.interface';

export type LeaveBalanceCreationAttributes = Optional<LeaveBalance, 'id' | 'usedDays'>;

export class LeaveBalanceModel extends Model<LeaveBalance, LeaveBalanceCreationAttributes> implements LeaveBalance {
  public id: number;
  public userId: number;
  public year: number;
  public totalDays: number;
  public usedDays: number;
}

export default function (sequelize: Sequelize): typeof LeaveBalanceModel {
  LeaveBalanceModel.init(
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
        references: { model: 'users', key: 'id' },
      },
      year: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      totalDays: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'total_days',
      },
      usedDays: {
        allowNull: true,
        type: DataTypes.INTEGER,
        field: 'used_days',
        defaultValue: 0,
      },
    },
    {
      tableName: 'leave_balances',
      sequelize,
      timestamps: false,
    },
  );

  return LeaveBalanceModel;
}
