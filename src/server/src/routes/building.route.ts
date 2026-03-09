import { Router } from 'express';
import { BuildingController } from '@controllers/building.controller';
import { CreateBuildingDto, UpdateBuildingDto } from '@dtos/building.dto';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';

export class BuildingRoute implements Routes {
  public path = '/buildings';
  public router = Router();
  public building = new BuildingController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, AuthMiddleware, this.building.getBuildings);
    this.router.get(`${this.path}/:id(\\d+)`, AuthMiddleware, this.building.getBuildingById);
    this.router.post(`${this.path}`, AuthMiddleware, ValidationMiddleware(CreateBuildingDto), this.building.createBuilding);
    this.router.put(`${this.path}/:id(\\d+)`, AuthMiddleware, ValidationMiddleware(UpdateBuildingDto, true), this.building.updateBuilding);
    this.router.delete(`${this.path}/:id(\\d+)`, AuthMiddleware, this.building.deleteBuilding);
  }
}
