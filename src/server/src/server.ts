import { App } from '@/app';
import { AuthRoute } from '@routes/auth.route';
import { DeviceReportRoute } from '@routes/device-reports.route';
import { DeviceRoute } from '@routes/devices.route';
import { DigitalSignatureRoute } from '@routes/digital-signature.route';
import { LeaveRequestRoute } from '@routes/leave.route';
import { PasswordResetRoute } from '@routes/password-reset.route';
import { UserRoute } from '@routes/users.route';
import { BuildingRoute } from '@routes/building.route';
import { RoomRoute } from '@routes/room.route';
import { EquipmentRoute } from '@routes/equipment.route';
import { ValidateEnv } from '@utils/validateEnv';
import { startDeviceReportsCron } from './crons/device-reports.cron';

ValidateEnv();

// Start background workers
startDeviceReportsCron();

const app = new App([
  new AuthRoute(),
  new PasswordResetRoute(),
  new UserRoute(),
  new BuildingRoute(),
  new RoomRoute(),
  new EquipmentRoute(),
  new DeviceRoute(),
  new DeviceReportRoute(),
  new LeaveRequestRoute(),
  new DigitalSignatureRoute(),
]);

app.listen();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});