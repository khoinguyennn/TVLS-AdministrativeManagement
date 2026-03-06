import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Building } from '@interfaces/facility.interface';

export type BuildingCreationAttributes = Optional<Building, 'id' | 'address' | 'floors' | 'description' | 'status' | 'createdAt' | 'updatedAt'>;

export class BuildingModel extends Model<Building, BuildingCreationAttributes> implements Building {
  public id: number;
  public name: string;
  public code: string;
  public address: string;
  public floors: number;
  public description: string;
  public status: 'active' | 'inactive' | 'maintenance';

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
      name: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      code: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING(50),
      },
      address: {
        allowNull: true,
        type: DataTypes.STRING(255),
      },
      floors: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      description: {
        allowNull: true,
        type: DataTypes.TEXT,
      },
      status: {
        allowNull: false,
        type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
        defaultValue: 'active',
      },
    },
    {
      tableName: 'buildings',
      sequelize,
    },
  );

  return BuildingModel;
}
