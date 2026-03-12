import { Router } from 'express';
import { WorkOrderController } from '@controllers/work-orders.controller';
import { CreateWorkOrderDto, UpdateWorkOrderDto } from '@dtos/work-orders.dto';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { RoleMiddleware } from '@middlewares/role.middleware';
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

    // Create (admin, manager)
    this.router.post(
      this.path,
      AuthMiddleware,
      RoleMiddleware('admin', 'manager'),
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

    // Delete
    this.router.delete(`${this.path}/:id(\\d+)`, AuthMiddleware, this.controller.delete);
  }
}
