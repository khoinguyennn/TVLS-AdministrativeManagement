import { Router } from 'express';
import { DeviceController } from '@controllers/device.controller';
import { CreateDeviceDto, UpdateDeviceDto } from '@dtos/device.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { AuthMiddleware } from '@middlewares/auth.middleware';

export class DeviceRoute implements Routes {
  public path = '/devices';
  public router = Router();
  public device = new DeviceController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, AuthMiddleware, this.device.getDevices);
    this.router.get(`${this.path}/:id(\\d+)`, AuthMiddleware, this.device.getDeviceById);
    this.router.post(`${this.path}`, AuthMiddleware, ValidationMiddleware(CreateDeviceDto), this.device.createDevice);
    this.router.put(`${this.path}/:id(\\d+)`, AuthMiddleware, ValidationMiddleware(UpdateDeviceDto, true), this.device.updateDevice);
    this.router.delete(`${this.path}/:id(\\d+)`, AuthMiddleware, this.device.deleteDevice);
  }
}
