import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { SignatureConfig } from '@interfaces/digital-signature.interface';

export type SignatureConfigCreationAttributes = Optional<SignatureConfig, 'id' | 'signatureImage' | 'pinHash'>;

export class SignatureConfigModel extends Model<SignatureConfig, SignatureConfigCreationAttributes> implements SignatureConfig {
  public id: number;
  public userId: number;
  public signatureImage?: string;
  public pinHash?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof SignatureConfigModel {
  SignatureConfigModel.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        allowNull: false,
        unique: true,
        type: DataTypes.INTEGER,
        field: 'user_id',
      },
      signatureImage: {
        allowNull: true,
        type: DataTypes.STRING(255),
        field: 'signature_image',
      },
      pinHash: {
        allowNull: true,
        type: DataTypes.STRING(255),
        field: 'pin_hash',
      },
    },
    {
      tableName: 'signature_configs',
      sequelize,
    },
  );

  return SignatureConfigModel;
}
