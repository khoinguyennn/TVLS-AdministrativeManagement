import { Sequelize, DataTypes, Model } from 'sequelize';
import { DigitalSignature } from '@interfaces/digital-signature.interface';

export class DigitalSignatureModel extends Model<DigitalSignature> implements DigitalSignature {
  public id: number;
  public entityType: 'leave_request';
  public entityId: number;
  public signedBy: number;
  public certificateInfo?: string;
  public documentHash?: string;
  public signatureValue?: string;
  public signedAt: Date;
}

export default function (sequelize: Sequelize): typeof DigitalSignatureModel {
  DigitalSignatureModel.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      entityType: {
        allowNull: false,
        type: DataTypes.ENUM('leave_request'),
        field: 'entity_type',
      },
      entityId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'entity_id',
      },
      signedBy: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'signed_by',
      },
      certificateInfo: {
        allowNull: true,
        type: DataTypes.TEXT,
        field: 'certificate_info',
      },
      documentHash: {
        allowNull: true,
        type: DataTypes.STRING(255),
        field: 'document_hash',
      },
      signatureValue: {
        allowNull: true,
        type: DataTypes.TEXT,
        field: 'signature_value',
      },
      signedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        field: 'signed_at',
      },
    },
    {
      tableName: 'digital_signatures',
      sequelize,
      timestamps: false,
    },
  );

  return DigitalSignatureModel;
}
