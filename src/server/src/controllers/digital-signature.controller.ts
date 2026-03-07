import { NextFunction, Response } from 'express';
import { Container } from 'typedi';
import { RequestWithUser } from '@interfaces/auth.interface';
import { DigitalSignatureService } from '@services/digital-signature.service';

export class DigitalSignatureController {
  public service = Container.get(DigitalSignatureService);

  public getConfig = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const config = await this.service.getConfig(userId);
      res.status(200).json({ success: true, data: config, message: 'getConfig' });
    } catch (error) {
      next(error);
    }
  };

  public uploadSignatureImage = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      if (!req.file) {
        res.status(400).json({ success: false, message: 'Vui lòng chọn file ảnh chữ ký' });
        return;
      }
      const result = await this.service.uploadSignatureImage(userId, req.file.path);
      res.status(200).json({ success: true, data: result, message: 'uploadSignatureImage' });
    } catch (error) {
      next(error);
    }
  };

  public saveDrawnSignature = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const { dataUrl } = req.body;
      if (!dataUrl) {
        res.status(400).json({ success: false, message: 'Dữ liệu chữ ký không hợp lệ' });
        return;
      }
      const result = await this.service.saveDrawnSignature(userId, dataUrl);
      res.status(200).json({ success: true, data: result, message: 'saveDrawnSignature' });
    } catch (error) {
      next(error);
    }
  };

  public deleteSignatureImage = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const result = await this.service.deleteSignatureImage(userId);
      res.status(200).json({ success: true, data: result, message: 'deleteSignatureImage' });
    } catch (error) {
      next(error);
    }
  };

  public setPin = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const { pin } = req.body;
      const result = await this.service.setPin(userId, pin);
      res.status(200).json({ success: true, data: result, message: 'setPin' });
    } catch (error) {
      next(error);
    }
  };

  public changePin = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const { currentPin, newPin } = req.body;
      const result = await this.service.changePin(userId, currentPin, newPin);
      res.status(200).json({ success: true, data: result, message: 'changePin' });
    } catch (error) {
      next(error);
    }
  };

  public verifyPin = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const { pin } = req.body;
      const result = await this.service.verifyPin(userId, pin);
      res.status(200).json({ success: true, data: result, message: 'verifyPin' });
    } catch (error) {
      next(error);
    }
  };
}
