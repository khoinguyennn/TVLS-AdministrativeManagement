import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { StaffOrganization } from '@interfaces/staff.interface';

export type StaffOrganizationCreationAttributes = Optional<
  StaffOrganization,
  'id' | 'isUnionMember' | 'unionJoinDate' | 'isPartyMember' | 'partyJoinDate'
>;

export class StaffOrganizationModel extends Model<StaffOrganization, StaffOrganizationCreationAttributes> implements StaffOrganization {
  public id: number;
  public staffProfileId: number;
  public isUnionMember: boolean;
  public unionJoinDate: string;
  public isPartyMember: boolean;
  public partyJoinDate: string;
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
        onDelete: 'CASCADE',
      },
      isUnionMember: { allowNull: false, type: DataTypes.BOOLEAN, field: 'is_union_member', defaultValue: false },
      unionJoinDate: { allowNull: true, type: DataTypes.DATEONLY, field: 'union_join_date' },
      isPartyMember: { allowNull: false, type: DataTypes.BOOLEAN, field: 'is_party_member', defaultValue: false },
      partyJoinDate: { allowNull: true, type: DataTypes.DATEONLY, field: 'party_join_date' },
    },
    {
      tableName: 'staff_organizations',
      sequelize,
      timestamps: false,
      underscored: true,
    },
  );

  return StaffOrganizationModel;
}
