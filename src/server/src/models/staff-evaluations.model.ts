import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { StaffEvaluation } from '@interfaces/staff.interface';

export type StaffEvaluationCreationAttributes = Optional<StaffEvaluation, 'id'>;

export class StaffEvaluationModel extends Model<StaffEvaluation, StaffEvaluationCreationAttributes> implements StaffEvaluation {
  public id: number;
  public staffProfileId: number;
  public civilServantRating: string;
  public excellentTeacher: boolean;
  public evaluationYear: number;
  public note: string;
}

export default function (sequelize: Sequelize): typeof StaffEvaluationModel {
  StaffEvaluationModel.init(
    {
      id: { autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
      staffProfileId: { 
        allowNull: false, 
        type: DataTypes.INTEGER, 
        field: 'staff_profile_id', 
        references: { model: 'staff_profiles', key: 'id' },
        onDelete: 'CASCADE',
      },
      civilServantRating: { allowNull: true, type: DataTypes.STRING(255), field: 'civil_servant_rating' },
      excellentTeacher: { allowNull: true, type: DataTypes.BOOLEAN, field: 'excellent_teacher', defaultValue: false },
      evaluationYear: { allowNull: true, type: DataTypes.INTEGER, field: 'evaluation_year' },
      note: { allowNull: true, type: DataTypes.TEXT },
    },
    {
      tableName: 'staff_evaluations',
      sequelize,
      timestamps: false,
      underscored: true,
    },
  );

  return StaffEvaluationModel;
}
