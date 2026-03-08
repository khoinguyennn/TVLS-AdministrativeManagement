import { Router } from 'express';
import { DeviceReportController } from '@controllers/device-reports.controller';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { uploadReportImage } from '@middlewares/upload.middleware';

export class DeviceReportRoute implements Routes {
  public path = '/device-reports';
  public router = Router();
  public controller = new DeviceReportController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/stats`, AuthMiddleware, this.controller.getStats);
    this.router.get(`${this.path}`, AuthMiddleware, this.controller.getAll);
    this.router.get(`${this.path}/:id(\\d+)`, AuthMiddleware, this.controller.getById);
    this.router.post(`${this.path}`, AuthMiddleware, uploadReportImage, this.controller.create);
    this.router.put(`${this.path}/:id(\\d+)`, AuthMiddleware, uploadReportImage, this.controller.update);
    this.router.delete(`${this.path}/:id(\\d+)`, AuthMiddleware, this.controller.delete);
  }
}
