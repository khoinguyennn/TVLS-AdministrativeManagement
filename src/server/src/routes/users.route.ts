import { Router } from 'express';
import { UserController } from '@controllers/users.controller';
import { CreateUserDto, UpdateProfileDto, UpdateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { uploadAvatar } from '@middlewares/upload.middleware';

export class UserRoute implements Routes {
  public path = '/users';
  public router = Router();
  public user = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Profile của user đang đăng nhập
    this.router.get(`${this.path}/me`, AuthMiddleware, this.user.getMyProfile);
    this.router.put(`${this.path}/me`, AuthMiddleware, ValidationMiddleware(UpdateProfileDto), this.user.updateMyProfile);
    this.router.post(`${this.path}/me/avatar`, AuthMiddleware, uploadAvatar, this.user.uploadAvatar);

    // CRUD users (admin)
    this.router.get(`${this.path}`, this.user.getUsers);
    this.router.get(`${this.path}/:id(\\d+)`, this.user.getUserById);
    this.router.post(`${this.path}`, ValidationMiddleware(CreateUserDto), this.user.createUser);
    this.router.put(`${this.path}/:id(\\d+)`, ValidationMiddleware(UpdateUserDto, true), this.user.updateUser);
    this.router.delete(`${this.path}/:id(\\d+)`, this.user.deleteUser);
  }
}
