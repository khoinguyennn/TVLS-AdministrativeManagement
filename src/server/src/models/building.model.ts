import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Building } from '@interfaces/facility.interface';

export type BuildingCreationAttributes = Optional<Building, 'id' | 'description'>;

export class BuildingModel extends Model<Building, BuildingCreationAttributes> implements Building {
  public declare id: number;
  public declare name: string;
  public declare description: string;
}

export default function (sequelize: Sequelize): typeof BuildingModel {
  BuildingModel.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      description: {
        allowNull: true,
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: 'buildings',
      sequelize,
      timestamps: false,
    },
  );

  return BuildingModel;
}
