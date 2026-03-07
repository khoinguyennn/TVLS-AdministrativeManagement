import { NextFunction, Request, Response } from 'express';
import { DB } from '@database';

export class DeviceController {
  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const devices = await DB.Devices.findAll({
        order: [['name', 'ASC']],
      });
      const plain = devices.map(d => d.get({ plain: true }));
      res.status(200).json({ success: true, data: plain, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
}
