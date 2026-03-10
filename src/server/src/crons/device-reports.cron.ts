import cron from 'node-cron';
import { Op } from 'sequelize';
import { DB } from '@database';
import { logger } from '@utils/logger';

/**
 * Auto-confirm device reports that have been in 'repaired' state
 * for more than 24 hours without user confirmation.
 */
export const startDeviceReportsCron = () => {
  // Chạy vào lúc 00:00 mỗi ngày, hoặc tự định nghĩa cron tùy nhu cầu (VD: '0 * * * *' cho mỗi giờ)
  cron.schedule('0 * * * *', async () => {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const reportsToConfirm = await DB.DeviceReports.findAll({
        where: {
          status: 'repaired',
          updatedAt: {
            [Op.lt]: oneDayAgo,
          },
        },
      });

      if (reportsToConfirm.length > 0) {
        for (const report of reportsToConfirm) {
          // Cập nhật trạng thái phiếu thành completed
          await report.update({ status: 'completed' });
          logger.info(`[CRON] Auto-confirmed DeviceReport #${report.id}.`);
        }
      }
    } catch (error) {
      logger.error(`[CRON] Error auto-confirming device reports: ${error}`);
    }
  });
};
