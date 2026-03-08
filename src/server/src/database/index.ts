import Sequelize from 'sequelize';
import { NODE_ENV, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE } from '@config';
import OTPModel from '@models/otp.model';
import UserModel from '@models/users.model';
import BuildingModel from '@models/building.model';
import RoomModel from '@models/room.model';
import EquipmentModel from '@models/equipment.model';
import DeviceModel from '@models/device.model';
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
const Buildings = BuildingModel(sequelize);
const Rooms = RoomModel(sequelize);
const Equipment = EquipmentModel(sequelize);
const Devices = DeviceModel(sequelize);

// Define associations
Users.hasMany(OTPs, {
  foreignKey: 'userId',
  as: 'passwordResetOtps',
});

OTPs.belongsTo(Users, {
  foreignKey: 'userId',
  as: 'user',
});

// Building - Room associations
Buildings.hasMany(Rooms, {
  foreignKey: 'buildingId',
  as: 'rooms',
});

Rooms.belongsTo(Buildings, {
  foreignKey: 'buildingId',
  as: 'building',
});

// Room - Equipment associations
Rooms.hasMany(Equipment, {
  foreignKey: 'roomId',
  as: 'equipment',
});

Equipment.belongsTo(Rooms, {
  foreignKey: 'roomId',
  as: 'room',
});

// Room - Device associations
Rooms.hasMany(Devices, {
  foreignKey: 'roomId',
  as: 'devices',
});

Devices.belongsTo(Rooms, {
  foreignKey: 'roomId',
  as: 'room',
});

export const DB = {
  Users,
  OTPs,
  Buildings,
  Rooms,
  Equipment,
  Devices,
  sequelize, // connection instance (RAW queries)
  Sequelize, // library
};
