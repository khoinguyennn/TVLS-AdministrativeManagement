import { DB } from '@database';
import { HttpException } from '@exceptions/HttpException';
import { Notification } from '@interfaces/notifications.interface';

class NotificationService {
  public notifications = DB.Notifications;

  public async getUserNotifications(userId: number): Promise<Notification[]> {
    if (!userId) throw new HttpException(400, "UserId is empty");

    const notifications = await this.notifications.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    return notifications;
  }

  public async getUnreadCount(userId: number): Promise<number> {
    if (!userId) throw new HttpException(400, "UserId is empty");

    const count = await this.notifications.count({
      where: { userId, isRead: false },
    });

    return count;
  }

  public async markAsRead(notificationId: number, userId: number): Promise<Notification> {
    if (!notificationId) throw new HttpException(400, "NotificationId is empty");

    const notification = await this.notifications.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) throw new HttpException(404, "Notification not found");

    if (!notification.isRead) {
      await notification.update({ isRead: true });
    }

    return notification;
  }

  public async markAllAsRead(userId: number): Promise<void> {
    if (!userId) throw new HttpException(400, "UserId is empty");

    await this.notifications.update(
      { isRead: true },
      { where: { userId, isRead: false } },
    );
  }

  public async createNotification(notificationData: Pick<Notification, 'userId' | 'title' | 'message' | 'type' | 'referenceId'>): Promise<Notification> {
    const createNotificationData: Notification = await this.notifications.create({ ...notificationData, isRead: false });
    return createNotificationData;
  }
}

export default NotificationService;
