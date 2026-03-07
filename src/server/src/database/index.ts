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
import { logger } from '@utils/logger';

const sequelize = new Sequelize.Sequelize(DB_DATABASE, DB_USER, DB_PASSWORD, {
  dialect: 'mysql',
  host: DB_HOST,
  port: DB_PORT,
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
    logger.info(time + 'ms' + ' ' + query);
  },
  benchmark: true,
});

sequelize.authenticate();

// Initialize models
const Users = UserModel(sequelize);
const OTPs = OTPModel(sequelize);
const Devices = DevicesModel(sequelize);
const DeviceReports = DeviceReportModel(sequelize);
const LeaveTypes = LeaveTypeModel(sequelize);
const LeaveRequests = LeaveRequestModel(sequelize);
const LeaveBalances = LeaveBalanceModel(sequelize);
const DigitalSignatures = DigitalSignatureModel(sequelize);
const SignatureConfigs = SignatureConfigModel(sequelize);

// Define associations
Users.hasMany(OTPs, {
  foreignKey: 'userId',
  as: 'passwordResetOtps',
});

OTPs.belongsTo(Users, {
  foreignKey: 'userId',
  as: 'user',
});

Users.hasMany(DeviceReports, {
  foreignKey: 'reporterId',
  as: 'deviceReports',
});

DeviceReports.belongsTo(Users, {
  foreignKey: 'reporterId',
  as: 'reporter',
});

Devices.hasMany(DeviceReports, {
  foreignKey: 'deviceId',
  as: 'reports',
});

DeviceReports.belongsTo(Devices, {
  foreignKey: 'deviceId',
  as: 'device',
});

Users.hasMany(DeviceReports, {
  foreignKey: 'assignedTo',
  as: 'assignedReports',
});

DeviceReports.belongsTo(Users, {
  foreignKey: 'assignedTo',
  as: 'assignee',
});

// Leave associations
Users.hasMany(LeaveRequests, { foreignKey: 'userId', as: 'leaveRequests' });
LeaveRequests.belongsTo(Users, { foreignKey: 'userId', as: 'user' });

LeaveTypes.hasMany(LeaveRequests, { foreignKey: 'leaveTypeId', as: 'requests' });
LeaveRequests.belongsTo(LeaveTypes, { foreignKey: 'leaveTypeId', as: 'leaveType' });

Users.hasMany(LeaveRequests, { foreignKey: 'approvedBy', as: 'approvedRequests' });
LeaveRequests.belongsTo(Users, { foreignKey: 'approvedBy', as: 'approver' });

Users.hasMany(LeaveBalances, { foreignKey: 'userId', as: 'leaveBalances' });
LeaveBalances.belongsTo(Users, { foreignKey: 'userId', as: 'user' });

// Digital Signature associations
Users.hasMany(DigitalSignatures, { foreignKey: 'signedBy', as: 'digitalSignatures' });
DigitalSignatures.belongsTo(Users, { foreignKey: 'signedBy', as: 'signer' });

// Signature Config associations
Users.hasOne(SignatureConfigs, { foreignKey: 'userId', as: 'signatureConfig' });
SignatureConfigs.belongsTo(Users, { foreignKey: 'userId', as: 'user' });

export const DB = {
  Users,
  OTPs,
  Devices,
  DeviceReports,
  LeaveTypes,
  LeaveRequests,
  LeaveBalances,
  DigitalSignatures,
  SignatureConfigs,
  sequelize, // connection instance (RAW queries)
  Sequelize, // library
};
