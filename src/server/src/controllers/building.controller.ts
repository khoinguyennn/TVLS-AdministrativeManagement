import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { CreateBuildingDto, UpdateBuildingDto } from '@dtos/building.dto';
import { Building } from '@interfaces/facility.interface';
import { BuildingService } from '@services/building.service';

export class BuildingController {
  public buildingService = Container.get(BuildingService);

  public getBuildings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buildings: Building[] = await this.buildingService.findAllBuildings();

      res.status(200).json({
        success: true,
        data: buildings,
        message: 'Lấy danh sách toà nhà thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  public getBuildingById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buildingId = Number(req.params.id);
      const building: Building = await this.buildingService.findBuildingById(buildingId);

      res.status(200).json({
        success: true,
        data: building,
        message: 'Lấy thông tin toà nhà thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  public createBuilding = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buildingData: CreateBuildingDto = req.body;
      const newBuilding: Building = await this.buildingService.createBuilding(buildingData);

      res.status(201).json({
        success: true,
        data: newBuilding,
        message: 'Tạo toà nhà thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  public updateBuilding = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buildingId = Number(req.params.id);
      const buildingData: UpdateBuildingDto = req.body;
      const updatedBuilding: Building = await this.buildingService.updateBuilding(buildingId, buildingData);

      res.status(200).json({
        success: true,
        data: updatedBuilding,
        message: 'Cập nhật toà nhà thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteBuilding = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buildingId = Number(req.params.id);
      const deletedBuilding: Building = await this.buildingService.deleteBuilding(buildingId);

      res.status(200).json({
        success: true,
        data: deletedBuilding,
        message: 'Xoá toà nhà thành công',
      });
    } catch (error) {
      next(error);
    }
  };
}
