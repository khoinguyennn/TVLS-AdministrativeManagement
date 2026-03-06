import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Building } from '@interfaces/facility.interface';

export type BuildingCreationAttributes = Optional<Building, 'id' | 'floors' | 'description' | 'createdAt' | 'updatedAt'>;

export class BuildingModel extends Model<Building, BuildingCreationAttributes> implements Building {
  public id: number;
  public code: string;
  public name: string;
  public floors: number;
  public description: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof BuildingModel {
  BuildingModel.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      code: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING(50),
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      floors: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      description: {
        allowNull: true,
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: 'buildings',
      sequelize,
    },
  );

  return BuildingModel;
}
