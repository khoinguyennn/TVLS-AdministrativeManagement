import { NextFunction, Response } from 'express';
import { Container } from 'typedi';
import { RequestWithUser } from '@interfaces/auth.interface';
import { StaffProfileService } from '@services/staff.service';

export class StaffProfileController {
  public service = Container.get(StaffProfileService);

  public getMyProfile = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const profile = await this.service.getMyProfile(userId);
      res.status(200).json({ success: true, data: profile, message: 'getMyProfile' });
    } catch (error) {
      next(error);
    }
  };

  public updateMyProfile = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const data = req.body;
      const profile = await this.service.upsertMyProfile(userId, data);
      res.status(200).json({ success: true, data: profile, message: 'updateMyProfile' });
    } catch (error) {
      next(error);
    }
  };
}
