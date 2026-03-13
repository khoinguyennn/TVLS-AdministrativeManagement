import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { StaffAddress } from '@interfaces/staff.interface';

export type StaffAddressCreationAttributes = Optional<StaffAddress, 'id' | 'province' | 'ward' | 'hamlet' | 'detailAddress' | 'phone'>;

export class StaffAddressModel extends Model<StaffAddress, StaffAddressCreationAttributes> implements StaffAddress {
  public id: number;
  public staffProfileId: number;
  public addressType: 'contact' | 'hometown';
  public province: string;
  public ward: string;
  public hamlet: string;
  public detailAddress: string;
  public phone: string;
}

export default function (sequelize: Sequelize): typeof StaffAddressModel {
  StaffAddressModel.init(
    {
      id: { autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },

      staffProfileId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'staff_profile_id',
        references: { model: 'staff_profiles', key: 'id' },
      },
      addressType: {
        allowNull: false,
        type: DataTypes.ENUM('contact', 'hometown'),
        field: 'address_type',
      },      province: { allowNull: true, type: DataTypes.STRING(100) },
      ward: { allowNull: true, type: DataTypes.STRING(100) },
      hamlet: { allowNull: true, type: DataTypes.STRING(100) },
      detailAddress: { allowNull: true, type: DataTypes.STRING(255), field: 'detail_address' },
      phone: { allowNull: true, type: DataTypes.STRING(20) },
    },
    {
      tableName: 'staff_addresses',
      sequelize,
      timestamps: false,
    },
  );

  return StaffAddressModel;
}
