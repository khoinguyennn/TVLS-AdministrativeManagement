import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { StaffQualification } from '@interfaces/staff.interface';

export type StaffQualificationCreationAttributes = Optional<StaffQualification, 'id'>;

export class StaffQualificationModel extends Model<StaffQualification, StaffQualificationCreationAttributes> implements StaffQualification {
  public declare id: number;
  public declare staffProfileId: number;
  public declare generalEducationLevel: string;
  public declare professionalLevel: string;
  public declare major: string;
  public declare trainingPlace: string;
  public declare graduationYear: number;
  public declare itLevel: string;
  public declare foreignLanguageLevel: string;
}

export default function (sequelize: Sequelize): typeof StaffQualificationModel {
  StaffQualificationModel.init(
    {
      id: { autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
      staffProfileId: { 
        allowNull: false, 
        type: DataTypes.INTEGER, 
        field: 'staff_profile_id', 
        references: { model: 'staff_profiles', key: 'id' },
        onDelete: 'CASCADE',
      },
      generalEducationLevel: { allowNull: true, type: DataTypes.STRING(255), field: 'general_education_level' },
      professionalLevel: { allowNull: true, type: DataTypes.STRING(255), field: 'professional_level' },
      major: { allowNull: true, type: DataTypes.STRING(255) },
      trainingPlace: { allowNull: true, type: DataTypes.STRING(255), field: 'training_place' },
      graduationYear: { allowNull: true, type: DataTypes.INTEGER, field: 'graduation_year' },
      itLevel: { allowNull: true, type: DataTypes.STRING(255), field: 'it_level' },
      foreignLanguageLevel: { allowNull: true, type: DataTypes.STRING(255), field: 'foreign_language_level' },
    },
    {
      tableName: 'staff_qualifications',
      sequelize,
      timestamps: false,
      underscored: true,
    },
  );

  return StaffQualificationModel;
}
