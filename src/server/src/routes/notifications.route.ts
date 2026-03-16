import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import NotificationsController from '@controllers/notifications.controller';

class NotificationRoute implements Routes {
  public path = '/notifications';
  public router = Router();
  public notificationController = new NotificationsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, AuthMiddleware, this.notificationController.getUserNotifications);
    this.router.get(`${this.path}/unread-count`, AuthMiddleware, this.notificationController.getUnreadCount);
    this.router.put(`${this.path}/mark-all-read`, AuthMiddleware, this.notificationController.markAllAsRead);
    this.router.put(`${this.path}/:id(\\d+)/read`, AuthMiddleware, this.notificationController.markAsRead);
  }
}

export default NotificationRoute;
