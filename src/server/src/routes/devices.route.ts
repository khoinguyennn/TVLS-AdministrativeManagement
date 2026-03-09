import { Router } from 'express';
import { DeviceController } from '@controllers/device.controller';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';

export class DeviceRoute implements Routes {
  public path = '/devices';
  public router = Router();
  public controller = new DeviceController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, AuthMiddleware, this.controller.getDevices);

    this.router.post(`${this.path}`, AuthMiddleware, this.controller.createDevice);
  }
}