import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Room } from '@interfaces/facility.interface';

export type RoomCreationAttributes = Optional<Room, 'id'>;

export class RoomModel extends Model<Room, RoomCreationAttributes> implements Room {
  public id: number;
  public buildingId: number;
  public name: string;
}

export default function (sequelize: Sequelize): typeof RoomModel {
  RoomModel.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      buildingId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'building_id',
        references: {
          model: 'buildings',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING(50),
      },
    },
    {
      tableName: 'rooms',
      sequelize,
      timestamps: false,
    },
  );

  return RoomModel;
}
