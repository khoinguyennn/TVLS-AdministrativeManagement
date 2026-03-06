import { Router } from 'express';
import { RoomController } from '@controllers/room.controller';
import { CreateRoomDto, UpdateRoomDto } from '@dtos/room.dto';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';

export class RoomRoute implements Routes {
  public path = '/rooms';
  public router = Router();
  public room = new RoomController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, AuthMiddleware, this.room.getRooms);
    this.router.get(`${this.path}/:id(\\d+)`, AuthMiddleware, this.room.getRoomById);
    this.router.post(`${this.path}`, AuthMiddleware, ValidationMiddleware(CreateRoomDto), this.room.createRoom);
    this.router.put(`${this.path}/:id(\\d+)`, AuthMiddleware, ValidationMiddleware(UpdateRoomDto, true), this.room.updateRoom);
    this.router.delete(`${this.path}/:id(\\d+)`, AuthMiddleware, this.room.deleteRoom);
  }
}
