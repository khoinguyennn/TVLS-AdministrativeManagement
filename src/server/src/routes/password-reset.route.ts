import { Router } from 'express';
import { PasswordResetController } from '@controllers/password-reset.controller';
import { ForgotPasswordDto, VerifyOTPDto, ResetPasswordDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';

export class PasswordResetRoute implements Routes {
  public path = '/auth';
  public router = Router();
  public passwordReset = new PasswordResetController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/forgot-password`,
      ValidationMiddleware(ForgotPasswordDto),
      this.passwordReset.forgotPassword
    );
    this.router.post(
      `${this.path}/verify-otp`,
      ValidationMiddleware(VerifyOTPDto),
      this.passwordReset.verifyOTP
    );
    this.router.post(
      `${this.path}/reset-password`,
      ValidationMiddleware(ResetPasswordDto),
      this.passwordReset.resetPassword
    );
  }
}
