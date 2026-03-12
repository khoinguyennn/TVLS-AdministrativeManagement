import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { StaffQualification } from '@interfaces/staff.interface';

export type StaffQualificationCreationAttributes = Optional<
  StaffQualification,
  'id' | 'generalEducationLevel' | 'professionalLevel' | 'major' | 'trainingPlace' | 'graduationYear' | 'itLevel' | 'foreignLanguageLevel'
>;

export class StaffQualificationModel extends Model<StaffQualification, StaffQualificationCreationAttributes> implements StaffQualification {
  public id: number;
  public staffProfileId: number;
  public generalEducationLevel: string;
  public professionalLevel: string;
  public major: string;
  public trainingPlace: string;
  public graduationYear: number;
  public itLevel: string;
  public foreignLanguageLevel: string;
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
      },
      generalEducationLevel: { allowNull: true, type: DataTypes.STRING(100), field: 'general_education_level' },
      professionalLevel: { allowNull: true, type: DataTypes.STRING(255), field: 'professional_level' },
      major: { allowNull: true, type: DataTypes.STRING(255) },
      trainingPlace: { allowNull: true, type: DataTypes.STRING(255), field: 'training_place' },
      graduationYear: { allowNull: true, type: DataTypes.INTEGER, field: 'graduation_year' },
      itLevel: { allowNull: true, type: DataTypes.STRING(100), field: 'it_level' },
      foreignLanguageLevel: { allowNull: true, type: DataTypes.STRING(100), field: 'foreign_language_level' },
    },
    {
      tableName: 'staff_qualifications',
      sequelize,
      timestamps: false,
    },
  );

  return StaffQualificationModel;
}
