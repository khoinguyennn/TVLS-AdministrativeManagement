import Sequelize from 'sequelize';
import { NODE_ENV, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE } from '@config';

import DeviceReportModel from '@models/device-reports.model';
import DevicesModel from '@models/devices.model';
import DigitalSignatureModel from '@models/digital-signatures.model';
import LeaveBalanceModel from '@models/leave-balances.model';
import LeaveRequestModel from '@models/leave-requests.model';
import LeaveTypeModel from '@models/leave-types.model';
import OTPModel from '@models/otp.model';
import SignatureConfigModel from '@models/signature-configs.model';
import UserModel from '@models/users.model';

import BuildingModel from '@models/building.model';
import RoomModel from '@models/room.model';
// import EquipmentModel from '@models/equipment.model'; // Not used - using devices instead
import DeviceModel from '@models/device.model';

import StaffProfileModel from '@models/staff-profile.model';
import StaffAddressModel from '@models/staff-address.model';
import StaffOrganizationModel from '@models/staff-organizations.model';
import StaffBankAccountModel from '@models/staff-bank-account.model';
import StaffPositionModel from '@models/staff-positions.model';
import StaffQualificationModel from '@models/staff-qualifications.model';
import StaffSalaryModel from '@models/staff-salaries.model';
import StaffEvaluationModel from '@models/staff-evaluations.model';

import { logger } from '@utils/logger';

const sequelize = new Sequelize.Sequelize(DB_DATABASE, DB_USER, DB_PASSWORD, {
  dialect: 'mysql',
  host: DB_HOST,
  port: Number(DB_PORT),
  timezone: '+07:00',
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    underscored: true,
    freezeTableName: true,
  },
  pool: {
    min: 0,
    max: 5,
  },
  logQueryParameters: NODE_ENV === 'development',
  logging: (query, time) => {
    logger.info(time + 'ms ' + query);
  },
  benchmark: true,
});

sequelize.authenticate();

// Initialize models
const Users = UserModel(sequelize);
const OTPs = OTPModel(sequelize);

const Buildings = BuildingModel(sequelize);
const Rooms = RoomModel(sequelize);
// const Equipment = EquipmentModel(sequelize); // Not used - using devices instead
const Devices = DevicesModel(sequelize);

const DeviceReports = DeviceReportModel(sequelize);
const LeaveTypes = LeaveTypeModel(sequelize);
const LeaveRequests = LeaveRequestModel(sequelize);
const LeaveBalances = LeaveBalanceModel(sequelize);

const DigitalSignatures = DigitalSignatureModel(sequelize);
const SignatureConfigs = SignatureConfigModel(sequelize);

const StaffProfiles = StaffProfileModel(sequelize);
const StaffAddresses = StaffAddressModel(sequelize);
const StaffOrganizations = StaffOrganizationModel(sequelize);
const StaffBankAccounts = StaffBankAccountModel(sequelize);
const StaffPositions = StaffPositionModel(sequelize);
const StaffQualifications = StaffQualificationModel(sequelize);
const StaffSalaries = StaffSalaryModel(sequelize);
const StaffEvaluations = StaffEvaluationModel(sequelize);

// ================= Associations =================

// OTP
Users.hasMany(OTPs, { foreignKey: 'userId', as: 'passwordResetOtps' });
OTPs.belongsTo(Users, { foreignKey: 'userId', as: 'user' });

// Building - Room
Buildings.hasMany(Rooms, { foreignKey: 'buildingId', as: 'rooms' });
Rooms.belongsTo(Buildings, { foreignKey: 'buildingId', as: 'building' });

// Room - Equipment (commented out - using devices instead)
// Rooms.hasMany(Equipment, { foreignKey: 'roomId', as: 'equipment' });
// Equipment.belongsTo(Rooms, { foreignKey: 'roomId', as: 'room' });

// Room - Device
Rooms.hasMany(Devices, { foreignKey: 'roomId', as: 'devices' });
Devices.belongsTo(Rooms, { foreignKey: 'roomId', as: 'room' });

// Device Reports
Users.hasMany(DeviceReports, { foreignKey: 'reporterId', as: 'deviceReports' });
DeviceReports.belongsTo(Users, { foreignKey: 'reporterId', as: 'reporter' });

Devices.hasMany(DeviceReports, { foreignKey: 'deviceId', as: 'reports' });
DeviceReports.belongsTo(Devices, { foreignKey: 'deviceId', as: 'device' });

Users.hasMany(DeviceReports, { foreignKey: 'assignedTo', as: 'assignedReports' });
DeviceReports.belongsTo(Users, { foreignKey: 'assignedTo', as: 'assignee' });

// Leave
Users.hasMany(LeaveRequests, { foreignKey: 'userId', as: 'leaveRequests' });
LeaveRequests.belongsTo(Users, { foreignKey: 'userId', as: 'user' });

LeaveTypes.hasMany(LeaveRequests, { foreignKey: 'leaveTypeId', as: 'requests' });
LeaveRequests.belongsTo(LeaveTypes, { foreignKey: 'leaveTypeId', as: 'leaveType' });

Users.hasMany(LeaveRequests, { foreignKey: 'approvedBy', as: 'approvedRequests' });
LeaveRequests.belongsTo(Users, { foreignKey: 'approvedBy', as: 'approver' });

Users.hasMany(LeaveBalances, { foreignKey: 'userId', as: 'leaveBalances' });
LeaveBalances.belongsTo(Users, { foreignKey: 'userId', as: 'user' });

// Digital signature
Users.hasMany(DigitalSignatures, { foreignKey: 'signedBy', as: 'digitalSignatures' });
DigitalSignatures.belongsTo(Users, { foreignKey: 'signedBy', as: 'signer' });

// Signature config
Users.hasOne(SignatureConfigs, { foreignKey: 'userId', as: 'signatureConfig' });
SignatureConfigs.belongsTo(Users, { foreignKey: 'userId', as: 'user' });

// Staff Profile
Users.hasOne(StaffProfiles, { foreignKey: 'userId', as: 'staffProfile' });
StaffProfiles.belongsTo(Users, { foreignKey: 'userId', as: 'user' });

// Staff Profile - Addresses
StaffProfiles.hasMany(StaffAddresses, { foreignKey: 'staffProfileId', as: 'addresses', onDelete: 'CASCADE' });
StaffAddresses.belongsTo(StaffProfiles, { foreignKey: 'staffProfileId', as: 'staffProfile' });

// Staff Profile - Organizations
StaffProfiles.hasOne(StaffOrganizations, { foreignKey: 'staffProfileId', as: 'organizations', onDelete: 'CASCADE' });
StaffOrganizations.belongsTo(StaffProfiles, { foreignKey: 'staffProfileId', as: 'staffProfile' });

// Staff Profile - Bank Accounts
StaffProfiles.hasMany(StaffBankAccounts, { foreignKey: 'staffProfileId', as: 'bankAccounts', onDelete: 'CASCADE' });
StaffBankAccounts.belongsTo(StaffProfiles, { foreignKey: 'staffProfileId', as: 'staffProfile' });

// Staff Profile - Positions
StaffProfiles.hasMany(StaffPositions, { foreignKey: 'staffProfileId', as: 'positions', onDelete: 'CASCADE' });
StaffPositions.belongsTo(StaffProfiles, { foreignKey: 'staffProfileId', as: 'staffProfile' });

// Staff Profile - Qualifications
StaffProfiles.hasMany(StaffQualifications, { foreignKey: 'staffProfileId', as: 'qualifications', onDelete: 'CASCADE' });
StaffQualifications.belongsTo(StaffProfiles, { foreignKey: 'staffProfileId', as: 'staffProfile' });

// Staff Profile - Salaries
StaffProfiles.hasMany(StaffSalaries, { foreignKey: 'staffProfileId', as: 'salaries', onDelete: 'CASCADE' });
StaffSalaries.belongsTo(StaffProfiles, { foreignKey: 'staffProfileId', as: 'staffProfile' });

// Staff Profile - Evaluations
StaffProfiles.hasMany(StaffEvaluations, { foreignKey: 'staffProfileId', as: 'evaluations', onDelete: 'CASCADE' });
StaffEvaluations.belongsTo(StaffProfiles, { foreignKey: 'staffProfileId', as: 'staffProfile' });

export const DB = {
  Users,
  OTPs,
  Buildings,
  Rooms,
  // Equipment, // Not used - using devices instead
  Devices,
  DeviceReports,
  LeaveTypes,
  LeaveRequests,
  LeaveBalances,
  DigitalSignatures,
  SignatureConfigs,
  StaffProfiles,
  StaffAddresses,
  StaffOrganizations,
  StaffBankAccounts,
  StaffPositions,
  StaffQualifications,
  StaffSalaries,
  StaffEvaluations,
  sequelize,
  Sequelize,
};
