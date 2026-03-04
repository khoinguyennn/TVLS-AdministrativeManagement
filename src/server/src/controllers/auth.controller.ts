import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { CreateUserDto, LoginDto, RefreshTokenDto, GoogleLoginDto } from '@dtos/users.dto';
import { User } from '@interfaces/users.interface';
import { RequestWithUser } from '@interfaces/auth.interface';
import { AuthService } from '@services/auth.service';

export class AuthController {
  public auth = Container.get(AuthService);

  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const signUpUserData: User = await this.auth.signup(userData);

      res.status(201).json({
        success: true,
        data: {
          id: signUpUserData.id,
          email: signUpUserData.email,
          fullName: signUpUserData.fullName,
          role: signUpUserData.role,
        },
        message: 'Đăng ký tài khoản thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginData: LoginDto = req.body;
      const { cookie, loginResponse } = await this.auth.login(loginData);

      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({
        success: true,
        data: loginResponse,
        message: 'Đăng nhập thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  public refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken }: RefreshTokenDto = req.body;
      const { cookie, accessToken } = await this.auth.refreshToken(refreshToken);

      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({
        success: true,
        data: { accessToken },
        message: 'Làm mới token thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      await this.auth.logout(userData);

      res.setHeader('Set-Cookie', ['Authorization=; Max-Age=0; Path=/']);
      res.status(200).json({
        success: true,
        message: 'Đăng xuất thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  public getProfile = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const userData = await this.auth.getProfile(userId);

      res.status(200).json({
        success: true,
        data: userData,
        message: 'Lấy thông tin người dùng thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  public googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { credential }: GoogleLoginDto = req.body;
      const { cookie, loginResponse } = await this.auth.loginWithGoogle(credential);

      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({
        success: true,
        data: loginResponse,
        message: 'Đăng nhập với Google thành công',
      });
    } catch (error) {
      next(error);
    }
  };
}
