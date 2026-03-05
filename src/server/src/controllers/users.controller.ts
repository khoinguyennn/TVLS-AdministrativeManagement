import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { CreateUserDto, UpdateProfileDto } from '@dtos/users.dto';
import { User } from '@interfaces/users.interface';
import { RequestWithUser } from '@interfaces/auth.interface';
import { UserService } from '@services/users.service';
import { HttpException } from '@exceptions/HttpException';

export class UserController {
  public user = Container.get(UserService);

  public getMyProfile = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const userData = await this.user.findUserById(userId);

      // Exclude password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = userData as User & { password: string };

      res.status(200).json({
        success: true,
        data: userWithoutPassword,
        message: 'Lấy thông tin thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  public updateMyProfile = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const updateData: UpdateProfileDto = req.body;
      const updatedUser = await this.user.updateProfile(userId, updateData);

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'Cập nhật thông tin thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllUsersData: User[] = await this.user.findAllUser();

      res.status(200).json({ data: findAllUsersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.params.id);
      const findOneUserData: User = await this.user.findUserById(userId);

      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const createUserData: User = await this.user.createUser(userData);

      res.status(201).json({ data: createUserData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.params.id);
      const userData: CreateUserDto = req.body;
      const updateUserData: User = await this.user.updateUser(userId, userData);

      res.status(200).json({ data: updateUserData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.params.id);
      const deleteUserData: User = await this.user.deleteUser(userId);

      res.status(200).json({ data: deleteUserData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public uploadAvatar = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new HttpException(400, 'Vui lòng chọn file ảnh');
      }

      const userId = req.user.id;
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      const updatedUser = await this.user.updateProfile(userId, { avatar: avatarUrl });

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'Cập nhật ảnh đại diện thành công',
      });
    } catch (error) {
      next(error);
    }
  };
}
