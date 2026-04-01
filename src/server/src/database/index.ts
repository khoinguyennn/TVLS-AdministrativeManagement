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
import NotificationModel from '@models/notifications.model';

import BuildingModel from '@models/building.model';
import RoomModel from '@models/room.model';
// import EquipmentModel from '@models/equipment.model'; // Not used - using devices instead
import DeviceModel from '@models/device.model';
import WorkOrderModel from '@models/work-orders.model';
import WorkOrderAttachmentModel from '@models/work-order-attachments.model';
import WorkOrderAssigneeModel from '@models/work-order-assignees.model';
import StaffProfileModel from '@models/staff-profile.model';
import StaffPositionModel from '@models/staff-position.model';
import StaffQualificationModel from '@models/staff-qualification.model';
import StaffAddressModel from '@models/staff-address.model';
import StaffBankAccountModel from '@models/staff-bank-account.model';
import StaffEvaluationModel from '@models/staff-evaluation.model';
import StaffOrganizationModel from '@models/staff-organization.model';
import StaffSalaryModel from '@models/staff-salary.model';

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
const Notifications = NotificationModel(sequelize);

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


const WorkOrders = WorkOrderModel(sequelize);
const WorkOrderAttachments = WorkOrderAttachmentModel(sequelize);
const WorkOrderAssignees = WorkOrderAssigneeModel(sequelize);

const StaffProfiles = StaffProfileModel(sequelize);
const StaffPositions = StaffPositionModel(sequelize);
const StaffQualifications = StaffQualificationModel(sequelize);
const StaffAddresses = StaffAddressModel(sequelize);
const StaffBankAccounts = StaffBankAccountModel(sequelize);
const StaffEvaluations = StaffEvaluationModel(sequelize);
const StaffOrganizations = StaffOrganizationModel(sequelize);
const StaffSalaries = StaffSalaryModel(sequelize);

// ================= Associations =================

// OTP
Users.hasMany(OTPs, { foreignKey: 'userId', as: 'passwordResetOtps' });
OTPs.belongsTo(Users, { foreignKey: 'userId', as: 'user' });

// Notifications
Users.hasMany(Notifications, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
Notifications.belongsTo(Users, { foreignKey: 'userId', as: 'user' });

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


// Work Orders
Users.hasMany(WorkOrders, { foreignKey: 'createdBy', as: 'createdWorkOrders' });
WorkOrders.belongsTo(Users, { foreignKey: 'createdBy', as: 'creator' });

Users.hasMany(WorkOrders, { foreignKey: 'approvedBy', as: 'approvedWorkOrders' });
WorkOrders.belongsTo(Users, { foreignKey: 'approvedBy', as: 'approver' });

Users.hasMany(WorkOrders, { foreignKey: 'assignedTo', as: 'assignedWorkOrders' });
WorkOrders.belongsTo(Users, { foreignKey: 'assignedTo', as: 'assignee' });

// Work Order Assignees (Many-to-Many)
WorkOrders.hasMany(WorkOrderAssignees, { foreignKey: 'work_order_id', as: 'assignees', onDelete: 'CASCADE' });
WorkOrderAssignees.belongsTo(WorkOrders, { foreignKey: 'work_order_id', as: 'workOrder' });

Users.hasMany(WorkOrderAssignees, { foreignKey: 'assigned_to_user_id', as: 'workOrderAssignments' });
WorkOrderAssignees.belongsTo(Users, { foreignKey: 'assigned_to_user_id', as: 'assignedUser' });

WorkOrders.hasMany(WorkOrderAttachments, { foreignKey: 'workOrderId', as: 'attachments', onDelete: 'CASCADE' });
WorkOrderAttachments.belongsTo(WorkOrders, { foreignKey: 'workOrderId', as: 'workOrder' });

Users.hasMany(WorkOrderAttachments, { foreignKey: 'uploadedBy', as: 'uploadedAttachments' });
WorkOrderAttachments.belongsTo(Users, { foreignKey: 'uploadedBy', as: 'uploader' });

// Staff Profiles
Users.hasOne(StaffProfiles, { foreignKey: 'userId', as: 'staffProfile', onDelete: 'CASCADE' });
StaffProfiles.belongsTo(Users, { foreignKey: 'userId', as: 'user' });

StaffProfiles.hasOne(StaffPositions, { foreignKey: 'staffProfileId', as: 'position', onDelete: 'CASCADE' });
StaffPositions.belongsTo(StaffProfiles, { foreignKey: 'staffProfileId', as: 'staffProfile' });

StaffProfiles.hasOne(StaffQualifications, { foreignKey: 'staffProfileId', as: 'qualification', onDelete: 'CASCADE' });
StaffQualifications.belongsTo(StaffProfiles, { foreignKey: 'staffProfileId', as: 'staffProfile' });

StaffProfiles.hasMany(StaffAddresses, { foreignKey: 'staffProfileId', as: 'addresses', onDelete: 'CASCADE' });
StaffAddresses.belongsTo(StaffProfiles, { foreignKey: 'staffProfileId', as: 'staffProfile' });

StaffProfiles.hasOne(StaffBankAccounts, { foreignKey: 'staffProfileId', as: 'bankAccount', onDelete: 'CASCADE' });
StaffBankAccounts.belongsTo(StaffProfiles, { foreignKey: 'staffProfileId', as: 'staffProfile' });

StaffProfiles.hasOne(StaffEvaluations, { foreignKey: 'staffProfileId', as: 'evaluation', onDelete: 'CASCADE' });
StaffEvaluations.belongsTo(StaffProfiles, { foreignKey: 'staffProfileId', as: 'staffProfile' });

StaffProfiles.hasOne(StaffOrganizations, { foreignKey: 'staffProfileId', as: 'organization', onDelete: 'CASCADE' });
StaffOrganizations.belongsTo(StaffProfiles, { foreignKey: 'staffProfileId', as: 'staffProfile' });

StaffProfiles.hasOne(StaffSalaries, { foreignKey: 'staffProfileId', as: 'salary', onDelete: 'CASCADE' });
StaffSalaries.belongsTo(StaffProfiles, { foreignKey: 'staffProfileId', as: 'staffProfile' });

export const DB = {
  Users,
  OTPs,
  Notifications,
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

  WorkOrders,
  WorkOrderAttachments,
  WorkOrderAssignees,
  StaffProfiles,
  StaffPositions,
  StaffQualifications,
  StaffAddresses,
  StaffBankAccounts,
  StaffEvaluations,
  StaffOrganizations,
  StaffSalaries,
  sequelize,
  Sequelize,
};
