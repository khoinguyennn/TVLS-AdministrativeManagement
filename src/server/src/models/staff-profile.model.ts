import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { StaffProfile } from '@interfaces/staff.interface';

export type StaffProfileCreationAttributes = Optional<
  StaffProfile,
  | 'id'
  | 'gender'
  | 'dateOfBirth'
  | 'cccdNumber'
  | 'cccdIssueDate'
  | 'cccdIssuePlace'
  | 'ethnicity'
  | 'religion'
  | 'staffStatus'
  | 'recruitmentDate'
  | 'createdAt'
  | 'updatedAt'
>;

export class StaffProfileModel extends Model<StaffProfile, StaffProfileCreationAttributes> implements StaffProfile {
  public declare id: number;
  public declare userId: number;
  public declare staffCode: string;
  public declare gender: 'male' | 'female' | 'other';
  public declare dateOfBirth: string;
  public declare cccdNumber: string;
  public declare cccdIssueDate: string;
  public declare cccdIssuePlace: string;
  public declare ethnicity: string;
  public declare religion: string;

  public declare staffStatus: 'working' | 'probation' | 'maternity_leave' | 'retired' | 'resigned';  public declare recruitmentDate: string;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

export default function (sequelize: Sequelize): typeof StaffProfileModel {
  StaffProfileModel.init(
    {
      id: { autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },

      userId: {
        allowNull: false,
        unique: true,
        type: DataTypes.INTEGER,
        field: 'user_id',
        references: { model: 'users', key: 'id' },
      },
      staffCode: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING(50),
        field: 'staff_code',
      },
      gender: {
        allowNull: true,
        type: DataTypes.ENUM('male', 'female', 'other'),
      },
      dateOfBirth: {
        allowNull: true,
        type: DataTypes.DATEONLY,
        field: 'date_of_birth',
      },
      cccdNumber: {
        allowNull: true,
        type: DataTypes.STRING(20),
        field: 'cccd_number',
      },
      cccdIssueDate: {
        allowNull: true,
        type: DataTypes.DATEONLY,
        field: 'cccd_issue_date',
      },
      cccdIssuePlace: {
        allowNull: true,
        type: DataTypes.STRING(255),
        field: 'cccd_issue_place',
      },
      ethnicity: {
        allowNull: true,
        type: DataTypes.STRING(100),
      },
      religion: {
        allowNull: true,
        type: DataTypes.STRING(100),
      },
      staffStatus: {
        allowNull: true,
        type: DataTypes.ENUM('working', 'probation', 'maternity_leave', 'retired', 'resigned'),
        field: 'staff_status',
        defaultValue: 'working',
      },
      recruitmentDate: {
        allowNull: true,
        type: DataTypes.DATEONLY,
        field: 'recruitment_date',
      },    },
    {
      tableName: 'staff_profiles',
      sequelize,
    },
  );

  return StaffProfileModel;
}
