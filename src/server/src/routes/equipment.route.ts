import { Router } from 'express';
import { EquipmentController } from '@controllers/equipment.controller';
import { CreateEquipmentDto, UpdateEquipmentDto } from '@dtos/equipment.dto';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';

export class EquipmentRoute implements Routes {
  public path = '/equipment';
  public router = Router();
  public equipment = new EquipmentController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, AuthMiddleware, this.equipment.getEquipment);
    this.router.get(`${this.path}/:id(\\d+)`, AuthMiddleware, this.equipment.getEquipmentById);
    this.router.post(`${this.path}`, AuthMiddleware, ValidationMiddleware(CreateEquipmentDto), this.equipment.createEquipment);
    this.router.put(`${this.path}/:id(\\d+)`, AuthMiddleware, ValidationMiddleware(UpdateEquipmentDto, true), this.equipment.updateEquipment);
    this.router.delete(`${this.path}/:id(\\d+)`, AuthMiddleware, this.equipment.deleteEquipment);
  }
}
