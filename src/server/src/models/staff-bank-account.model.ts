import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { StaffBankAccount } from '@interfaces/staff.interface';


export type StaffBankAccountCreationAttributes = Optional<StaffBankAccount, 'id' | 'bankName' | 'branch' | 'accountNumber'>;
export class StaffBankAccountModel extends Model<StaffBankAccount, StaffBankAccountCreationAttributes> implements StaffBankAccount {
  public declare id: number;
  public declare staffProfileId: number;
  public declare bankName: string;
  public declare branch: string;
  public declare accountNumber: string;
}

export default function (sequelize: Sequelize): typeof StaffBankAccountModel {
  StaffBankAccountModel.init(
    {
      id: { autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },

      staffProfileId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: 'staff_profile_id',
        references: { model: 'staff_profiles', key: 'id' },
      },
      bankName: { allowNull: true, type: DataTypes.STRING(255), field: 'bank_name' },      branch: { allowNull: true, type: DataTypes.STRING(255) },
      accountNumber: { allowNull: true, type: DataTypes.STRING(50), field: 'account_number' },
    },
    {
      tableName: 'staff_bank_accounts',
      sequelize,
      timestamps: false,
    },
  );

  return StaffBankAccountModel;
}
