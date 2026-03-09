import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Equipment } from '@interfaces/facility.interface';

export type EquipmentCreationAttributes = Optional<
  Equipment,
  'id' | 'brand' | 'model' | 'serialNumber' | 'purchaseDate' | 'warrantyExpiry' | 'price' | 'description' | 'createdAt' | 'updatedAt'
>;

export class EquipmentModel extends Model<Equipment, EquipmentCreationAttributes> implements Equipment {
  public id: number;
  public roomId: number;
  public name: string;
  public code: string;
  public category: 'computer' | 'projector' | 'furniture' | 'lab-equipment' | 'other';
  public brand: string;
  public model: string;
  public serialNumber: string;
  public purchaseDate: Date;
  public warrantyExpiry: Date;
  public price: number;
  public status: 'working' | 'broken' | 'maintenance' | 'disposed';
  public description: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof EquipmentModel {
  EquipmentModel.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      roomId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'room_id',
        references: {
          model: 'rooms',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      category: {
        allowNull: false,
        type: DataTypes.ENUM('computer', 'projector', 'furniture', 'lab-equipment', 'other'),
        defaultValue: 'other',
      },
      brand: {
        allowNull: true,
        type: DataTypes.STRING(100),
      },
      model: {
        allowNull: true,
        type: DataTypes.STRING(100),
      },
      serialNumber: {
        allowNull: true,
        type: DataTypes.STRING(100),
        field: 'serial_number',
      },
      purchaseDate: {
        allowNull: true,
        type: DataTypes.DATE,
        field: 'purchase_date',
      },
      warrantyExpiry: {
        allowNull: true,
        type: DataTypes.DATE,
        field: 'warranty_expiry',
      },
      price: {
        allowNull: true,
        type: DataTypes.DECIMAL(15, 2),
      },
      status: {
        allowNull: false,
        type: DataTypes.ENUM('working', 'broken', 'maintenance', 'disposed'),
        defaultValue: 'working',
      },
      description: {
        allowNull: true,
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: 'equipment',
      sequelize,
    },
  );

  return EquipmentModel;
}
