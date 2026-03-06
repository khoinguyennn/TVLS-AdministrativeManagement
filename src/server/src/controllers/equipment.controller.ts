import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { CreateEquipmentDto, UpdateEquipmentDto } from '@dtos/equipment.dto';
import { Equipment } from '@interfaces/facility.interface';
import { EquipmentService } from '@services/equipment.service';

export class EquipmentController {
  public equipmentService = Container.get(EquipmentService);

  public getEquipment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roomId } = req.query;

      let equipment: Equipment[];
      if (roomId) {
        equipment = await this.equipmentService.findEquipmentByRoom(Number(roomId));
      } else {
        equipment = await this.equipmentService.findAllEquipment();
      }

      res.status(200).json({
        success: true,
        data: equipment,
        message: 'Lấy danh sách thiết bị thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  public getEquipmentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const equipmentId = Number(req.params.id);
      const equipment: Equipment = await this.equipmentService.findEquipmentById(equipmentId);

      res.status(200).json({
        success: true,
        data: equipment,
        message: 'Lấy thông tin thiết bị thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  public createEquipment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const equipmentData: CreateEquipmentDto = req.body;
      const newEquipment: Equipment = await this.equipmentService.createEquipment(equipmentData);

      res.status(201).json({
        success: true,
        data: newEquipment,
        message: 'Tạo thiết bị thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  public updateEquipment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const equipmentId = Number(req.params.id);
      const equipmentData: UpdateEquipmentDto = req.body;
      const updatedEquipment: Equipment = await this.equipmentService.updateEquipment(equipmentId, equipmentData);

      res.status(200).json({
        success: true,
        data: updatedEquipment,
        message: 'Cập nhật thiết bị thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteEquipment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const equipmentId = Number(req.params.id);
      const deletedEquipment: Equipment = await this.equipmentService.deleteEquipment(equipmentId);

      res.status(200).json({
        success: true,
        data: deletedEquipment,
        message: 'Xoá thiết bị thành công',
      });
    } catch (error) {
      next(error);
    }
  };
}
