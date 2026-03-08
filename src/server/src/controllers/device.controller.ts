import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { CreateDeviceDto, UpdateDeviceDto } from '@dtos/device.dto';
import { Device } from '@interfaces/facility.interface';
import { DeviceService } from '@services/device.service';

export class DeviceController {
  public deviceService = Container.get(DeviceService);

  public getDevices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roomId } = req.query;

      let devices: Device[];
      if (roomId) {
        devices = await this.deviceService.findDevicesByRoom(Number(roomId));
      } else {
        devices = await this.deviceService.findAllDevices();
      }

      res.status(200).json({
        success: true,
        data: devices,
        message: 'Lấy danh sách thiết bị thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  public getDeviceById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deviceId = Number(req.params.id);
      const device: Device = await this.deviceService.findDeviceById(deviceId);

      res.status(200).json({
        success: true,
        data: device,
        message: 'Lấy thông tin thiết bị thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  public createDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deviceData: CreateDeviceDto = req.body;
      const newDevice: Device = await this.deviceService.createDevice(deviceData);

      res.status(201).json({
        success: true,
        data: newDevice,
        message: 'Tạo thiết bị thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  public updateDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deviceId = Number(req.params.id);
      const deviceData: UpdateDeviceDto = req.body;
      const updatedDevice: Device = await this.deviceService.updateDevice(deviceId, deviceData);

      res.status(200).json({
        success: true,
        data: updatedDevice,
        message: 'Cập nhật thiết bị thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deviceId = Number(req.params.id);
      const deletedDevice: Device = await this.deviceService.deleteDevice(deviceId);

      res.status(200).json({
        success: true,
        data: deletedDevice,
        message: 'Xoá thiết bị thành công',
      });
    } catch (error) {
      next(error);
    }
  };
}
