import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { StaffOrganization } from '@interfaces/staff.interface';

export type StaffOrganizationCreationAttributes = Optional<StaffOrganization, 'id' | 'isUnionMember' | 'unionJoinDate' | 'isPartyMember' | 'partyJoinDate'>;

export class StaffOrganizationModel extends Model<StaffOrganization, StaffOrganizationCreationAttributes> implements StaffOrganization {
  public declare id: number;
  public declare staffProfileId: number;
  public declare isUnionMember: boolean;
  public declare unionJoinDate: string;
  public declare isPartyMember: boolean;
  public declare partyJoinDate: string;
}

export default function (sequelize: Sequelize): typeof StaffOrganizationModel {
  StaffOrganizationModel.init(
    {
      id: { autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
      staffProfileId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'staff_profile_id',
        references: { model: 'staff_profiles', key: 'id' },
      },
      isUnionMember: { allowNull: true, type: DataTypes.BOOLEAN, field: 'is_union_member', defaultValue: false },
      unionJoinDate: { allowNull: true, type: DataTypes.DATEONLY, field: 'union_join_date' },
      isPartyMember: { allowNull: true, type: DataTypes.BOOLEAN, field: 'is_party_member', defaultValue: false },
      partyJoinDate: { allowNull: true, type: DataTypes.DATEONLY, field: 'party_join_date' },
    },
    {
      tableName: 'staff_organizations',
      sequelize,
      timestamps: false,
    },
  );

  return StaffOrganizationModel;
}
