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
  public id: number;
  public userId: number;
  public staffCode: string;
  public gender: 'male' | 'female' | 'other';
  public dateOfBirth: string;
  public cccdNumber: string;
  public cccdIssueDate: string;
  public cccdIssuePlace: string;
  public ethnicity: string;
  public religion: string;

  public staffStatus: 'working' | 'probation' | 'maternity_leave' | 'retired' | 'resigned';  public recruitmentDate: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
