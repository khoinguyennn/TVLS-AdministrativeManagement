import { NextFunction, Request, Response } from 'express';
import { Notification } from '@interfaces/notifications.interface';
import NotificationService from '@services/notifications.service';
import { RequestWithUser } from '@interfaces/auth.interface';

class NotificationsController {
  public notificationService = new NotificationService();

  public getUserNotifications = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.id;
      const notifications = await this.notificationService.getUserNotifications(userId);
      res.status(200).json({ data: notifications, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getUnreadCount = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.id;
      const count = await this.notificationService.getUnreadCount(userId);
      res.status(200).json({ data: { count }, message: 'unreadCount' });
    } catch (error) {
      next(error);
    }
  };

  public markAsRead = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.id;
      const notificationId = Number(req.params.id);
      const notification = await this.notificationService.markAsRead(notificationId, userId);
      res.status(200).json({ data: notification, message: 'markedAsRead' });
    } catch (error) {
      next(error);
    }
  };

  public markAllAsRead = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.id;
      await this.notificationService.markAllAsRead(userId);
      res.status(200).json({ message: 'markedAllAsRead' });
    } catch (error) {
      next(error);
    }
  };
}

export default NotificationsController;
