import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { CreateRoomDto, UpdateRoomDto } from '@dtos/room.dto';
import { Room } from '@interfaces/facility.interface';
import { RoomService } from '@services/room.service';

export class RoomController {
  public roomService = Container.get(RoomService);

  public getRooms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { buildingId } = req.query;

      let rooms: Room[];
      if (buildingId) {
        rooms = await this.roomService.findRoomsByBuilding(Number(buildingId));
      } else {
        rooms = await this.roomService.findAllRooms();
      }

      res.status(200).json({
        success: true,
        data: rooms,
        message: 'Lấy danh sách phòng thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  public getRoomById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roomId = Number(req.params.id);
      const room: Room = await this.roomService.findRoomById(roomId);

      res.status(200).json({
        success: true,
        data: room,
        message: 'Lấy thông tin phòng thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  public createRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roomData: CreateRoomDto = req.body;
      const newRoom: Room = await this.roomService.createRoom(roomData);

      res.status(201).json({
        success: true,
        data: newRoom,
        message: 'Tạo phòng thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  public updateRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roomId = Number(req.params.id);
      const roomData: UpdateRoomDto = req.body;
      const updatedRoom: Room = await this.roomService.updateRoom(roomId, roomData);

      res.status(200).json({
        success: true,
        data: updatedRoom,
        message: 'Cập nhật phòng thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roomId = Number(req.params.id);
      const deletedRoom: Room = await this.roomService.deleteRoom(roomId);

      res.status(200).json({
        success: true,
        data: deletedRoom,
        message: 'Xoá phòng thành công',
      });
    } catch (error) {
      next(error);
    }
  };
}
