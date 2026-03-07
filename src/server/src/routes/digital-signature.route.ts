import { Router } from 'express';
import { DigitalSignatureController } from '@controllers/digital-signature.controller';
import { SetSignaturePinDto, ChangeSignaturePinDto, VerifySignaturePinDto } from '@dtos/digital-signature.dto';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { uploadSignatureImage } from '@middlewares/upload.middleware';

export class DigitalSignatureRoute implements Routes {
  public path = '/digital-signatures';
  public router = Router();
  public controller = new DigitalSignatureController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Signature config
    this.router.get(`${this.path}/config`, AuthMiddleware, this.controller.getConfig);

    // Signature image
    this.router.post(`${this.path}/upload`, AuthMiddleware, uploadSignatureImage, this.controller.uploadSignatureImage);
    this.router.post(`${this.path}/draw`, AuthMiddleware, this.controller.saveDrawnSignature);
    this.router.delete(`${this.path}/image`, AuthMiddleware, this.controller.deleteSignatureImage);

    // PIN management
    this.router.post(`${this.path}/pin/set`, AuthMiddleware, ValidationMiddleware(SetSignaturePinDto), this.controller.setPin);
    this.router.put(`${this.path}/pin/change`, AuthMiddleware, ValidationMiddleware(ChangeSignaturePinDto), this.controller.changePin);
    this.router.post(`${this.path}/pin/verify`, AuthMiddleware, ValidationMiddleware(VerifySignaturePinDto), this.controller.verifyPin);
  }
}
