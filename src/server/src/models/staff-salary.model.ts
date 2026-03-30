import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { StaffSalary } from '@interfaces/staff.interface';

export type StaffSalaryCreationAttributes = Optional<
  StaffSalary,
  | 'id'
  | 'salaryCoefficient'
  | 'salaryLevel'
  | 'baseSalary'
  | 'salaryStartDate'
  | 'unionAllowancePercent'
  | 'seniorityAllowancePercent'
  | 'incentiveAllowancePercent'
  | 'positionAllowancePercent'
  | 'salaryNote'
>;

export class StaffSalaryModel extends Model<StaffSalary, StaffSalaryCreationAttributes> implements StaffSalary {
  public declare id: number;
  public declare staffProfileId: number;
  public declare salaryCoefficient: number;
  public declare salaryLevel: number;
  public declare baseSalary: number;
  public declare salaryStartDate: string;
  public declare unionAllowancePercent: number;
  public declare seniorityAllowancePercent: number;
  public declare incentiveAllowancePercent: number;
  public declare positionAllowancePercent: number;
  public declare salaryNote: string;
}

export default function (sequelize: Sequelize): typeof StaffSalaryModel {
  StaffSalaryModel.init(
    {
      id: { autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
      staffProfileId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'staff_profile_id',
        references: { model: 'staff_profiles', key: 'id' },
      },
      salaryCoefficient: { allowNull: true, type: DataTypes.DECIMAL(5, 2), field: 'salary_coefficient' },
      salaryLevel: { allowNull: true, type: DataTypes.INTEGER, field: 'salary_level' },
      baseSalary: { allowNull: true, type: DataTypes.BIGINT, field: 'base_salary' },
      salaryStartDate: { allowNull: true, type: DataTypes.DATEONLY, field: 'salary_start_date' },
      unionAllowancePercent: { allowNull: true, type: DataTypes.DECIMAL(5, 2), field: 'union_allowance_percent' },
      seniorityAllowancePercent: { allowNull: true, type: DataTypes.DECIMAL(5, 2), field: 'seniority_allowance_percent' },
      incentiveAllowancePercent: { allowNull: true, type: DataTypes.DECIMAL(5, 2), field: 'incentive_allowance_percent' },
      positionAllowancePercent: { allowNull: true, type: DataTypes.DECIMAL(5, 2), field: 'position_allowance_percent' },
      salaryNote: { allowNull: true, type: DataTypes.TEXT, field: 'salary_note' },
    },
    {
      tableName: 'staff_salaries',
      sequelize,
      timestamps: false,
    },
  );

  return StaffSalaryModel;
}
