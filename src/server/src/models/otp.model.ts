import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface OTPAttributes {
  id: number;
  userId: number;
  email: string;
  otp: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type OTPCreationAttributes = Optional<OTPAttributes, 'id' | 'isUsed'>;

export class OTPModel extends Model<OTPAttributes, OTPCreationAttributes> implements OTPAttributes {
  public id: number;
  public userId: number;
  public email: string;
  public otp: string;
  public expiresAt: Date;
  public isUsed: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof OTPModel {
  OTPModel.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      otp: {
        allowNull: false,
        type: DataTypes.STRING(6),
      },
      expiresAt: {
        allowNull: false,
        type: DataTypes.DATE,
        field: 'expires_at',
      },
      isUsed: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_used',
      },
    },
    {
      tableName: 'password_reset_otps',
      sequelize,
      timestamps: true,
      underscored: true,
    },
  );

  return OTPModel;
}
