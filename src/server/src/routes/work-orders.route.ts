import { Router } from 'express';
import { WorkOrderController } from '@controllers/work-orders.controller';
import { CreateWorkOrderDto, UpdateWorkOrderDto } from '@dtos/work-orders.dto';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { RoleMiddleware } from '@middlewares/role.middleware';
import { uploadWorkOrderEvidence } from '@middlewares/upload.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';

export class WorkOrderRoute implements Routes {
  public path = '/work-orders';
  public router = Router();
  public controller = new WorkOrderController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // List & get
    this.router.get(this.path, AuthMiddleware, this.controller.getAll);
    this.router.get(`${this.path}/:id(\\d+)`, AuthMiddleware, this.controller.getById);
    this.router.get(`${this.path}/:id(\\d+)/pdf`, AuthMiddleware, this.controller.exportPdf);

    // Create (admin, manager, teacher, technician)
    this.router.post(
      this.path,
      AuthMiddleware,
      RoleMiddleware('admin', 'manager', 'teacher', 'technician'),
      ValidationMiddleware(CreateWorkOrderDto),
      this.controller.create,
    );

    // Update
    this.router.put(
      `${this.path}/:id(\\d+)`,
      AuthMiddleware,
      ValidationMiddleware(UpdateWorkOrderDto, true),
      this.controller.update,
    );

    // Approve / Reject (admin, manager)
    this.router.put(`${this.path}/:id(\\d+)/approve`, AuthMiddleware, RoleMiddleware('admin', 'manager'), this.controller.approve);
    this.router.put(`${this.path}/:id(\\d+)/reject`, AuthMiddleware, RoleMiddleware('admin', 'manager'), this.controller.reject);

    // Execution workflow
    this.router.post(`${this.path}/:id(\\d+)/evidence`, AuthMiddleware, uploadWorkOrderEvidence, this.controller.uploadEvidence);
    this.router.put(`${this.path}/:id(\\d+)/submit-completion`, AuthMiddleware, this.controller.submitCompletion);
    this.router.put(
      `${this.path}/:id(\\d+)/confirm-completion`,
      AuthMiddleware,
      RoleMiddleware('admin', 'manager'),
      this.controller.confirmCompletion,
    );
    this.router.put(
      `${this.path}/:id(\\d+)/request-rework`,
      AuthMiddleware,
      RoleMiddleware('admin', 'manager'),
      this.controller.requestRework,
    );
    this.router.put(
      `${this.path}/:id(\\d+)/resubmit-for-rework`,
      AuthMiddleware,
      this.controller.resubmitForRework,
    );

    // Delete
    this.router.delete(`${this.path}/:id(\\d+)`, AuthMiddleware, this.controller.delete);
  }
}
