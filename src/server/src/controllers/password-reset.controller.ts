import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { ForgotPasswordDto, VerifyOTPDto, ResetPasswordDto } from '@dtos/users.dto';
import { PasswordResetService } from '@services/password-reset.service';

export class PasswordResetController {
  public passwordReset = Container.get(PasswordResetService);

  public forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: ForgotPasswordDto = req.body;
      const result = await this.passwordReset.forgotPassword(data);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  public verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: VerifyOTPDto = req.body;
      const result = await this.passwordReset.verifyOTP(data);

      res.status(200).json({
        success: true,
        data: { valid: result.valid },
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: ResetPasswordDto = req.body;
      const result = await this.passwordReset.resetPassword(data);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
}
