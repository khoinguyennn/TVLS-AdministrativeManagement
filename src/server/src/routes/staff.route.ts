import { Router } from 'express';
import { StaffProfileController } from '@controllers/staff.controller';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';

export class StaffProfileRoute implements Routes {
  public path = '/staff-profiles';
  public router = Router();
  public controller = new StaffProfileController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Lấy thông tin cá nhân của user hiện tại
    this.router.get(`${this.path}/me`, AuthMiddleware, this.controller.getMyProfile);

    // Cập nhật thông tin cá nhân
    this.router.put(`${this.path}/me`, AuthMiddleware, this.controller.updateMyProfile);
  }
}
