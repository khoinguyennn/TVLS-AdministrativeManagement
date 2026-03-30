import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { LeaveRequest } from '@interfaces/leave.interface';

export type LeaveRequestCreationAttributes = Optional<
  LeaveRequest,
  'id' | 'reason' | 'status' | 'approvedBy' | 'rejectedReason' | 'signedAt' | 'approverSignedAt' | 'createdAt' | 'updatedAt'
>;

export class LeaveRequestModel extends Model<LeaveRequest, LeaveRequestCreationAttributes> implements LeaveRequest {
  public declare id: number;
  public declare userId: number;
  public declare leaveTypeId: number;
  public declare startDate: string;
  public declare endDate: string;
  public declare totalDays: number;
  public declare reason: string;
  public declare status: 'pending' | 'approved' | 'rejected';
  public declare approvedBy: number;
  public declare rejectedReason: string;
  public declare signedAt: Date;
  public declare approverSignedAt: Date;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

export default function (sequelize: Sequelize): typeof LeaveRequestModel {
  LeaveRequestModel.init(
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
      leaveTypeId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'leave_type_id',
        references: { model: 'leave_types', key: 'id' },
      },
      startDate: {
        allowNull: false,
        type: DataTypes.DATEONLY,
        field: 'start_date',
      },
      endDate: {
        allowNull: false,
        type: DataTypes.DATEONLY,
        field: 'end_date',
      },
      totalDays: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'total_days',
      },
      reason: {
        allowNull: true,
        type: DataTypes.TEXT,
      },
      status: {
        allowNull: true,
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
      },
      approvedBy: {
        allowNull: true,
        type: DataTypes.INTEGER,
        field: 'approved_by',
        references: { model: 'users', key: 'id' },
      },
      rejectedReason: {
        allowNull: true,
        type: DataTypes.TEXT,
        field: 'rejected_reason',
      },
      signedAt: {
        allowNull: true,
        type: DataTypes.DATE,
        field: 'signed_at',
      },
      approverSignedAt: {
        allowNull: true,
        type: DataTypes.DATE,
        field: 'approver_signed_at',
      },
    },
    {
      tableName: 'leave_requests',
      sequelize,
    },
  );

  return LeaveRequestModel;
}
