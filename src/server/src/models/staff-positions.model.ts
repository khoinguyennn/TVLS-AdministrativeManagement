import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { StaffPosition } from '@interfaces/staff.interface';

export type StaffPositionCreationAttributes = Optional<StaffPosition, 'id'>;

export class StaffPositionModel extends Model<StaffPosition, StaffPositionCreationAttributes> implements StaffPosition {
  public declare id: number;
  public declare staffProfileId: number;
  public declare jobPosition: string;
  public declare positionGroup: string;
  public declare recruitmentAgency: string;
  public declare professionWhenRecruited: string;
  public declare rankLevel: string;
  public declare educationLevel: string;
  public declare rankCode: string;
  public declare subjectGroup: string;
  public declare contractType: string;
}

export default function (sequelize: Sequelize): typeof StaffPositionModel {
  StaffPositionModel.init(
    {
      id: { autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
      staffProfileId: { 
        allowNull: false, 
        type: DataTypes.INTEGER, 
        field: 'staff_profile_id', 
        references: { model: 'staff_profiles', key: 'id' },
        onDelete: 'CASCADE',
      },
      jobPosition: { allowNull: true, type: DataTypes.STRING(255), field: 'job_position' },
      positionGroup: { allowNull: true, type: DataTypes.STRING(255), field: 'position_group' },
      recruitmentAgency: { allowNull: true, type: DataTypes.STRING(255), field: 'recruitment_agency' },
      professionWhenRecruited: { allowNull: true, type: DataTypes.STRING(255), field: 'profession_when_recruited' },
      rankLevel: { allowNull: true, type: DataTypes.STRING(255), field: 'rank_level' },
      educationLevel: { allowNull: true, type: DataTypes.STRING(255), field: 'education_level' },
      rankCode: { allowNull: true, type: DataTypes.STRING(50), field: 'rank_code' },
      subjectGroup: { allowNull: true, type: DataTypes.STRING(255), field: 'subject_group' },
      contractType: { allowNull: true, type: DataTypes.STRING(255), field: 'contract_type' },
    },
    {
      tableName: 'staff_positions',
      sequelize,
      timestamps: false,
      underscored: true,
    },
  );

  return StaffPositionModel;
}
