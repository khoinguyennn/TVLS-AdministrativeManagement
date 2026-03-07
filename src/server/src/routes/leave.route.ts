import { Router } from 'express';
import { LeaveRequestController } from '@controllers/leave.controller';
import { CreateLeaveRequestDto, CreateLeaveTypeDto, CreateLeaveBalanceDto } from '@dtos/leave.dto';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';

export class LeaveRequestRoute implements Routes {
  public path = '/leave-requests';
  public router = Router();
  public controller = new LeaveRequestController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Stats
    this.router.get(`${this.path}/stats`, AuthMiddleware, this.controller.getStats);

    // Leave Types
    this.router.get(`/leave-types`, AuthMiddleware, this.controller.getLeaveTypes);
    this.router.post(`/leave-types`, AuthMiddleware, ValidationMiddleware(CreateLeaveTypeDto), this.controller.createLeaveType);

    // Leave Balances
    this.router.get(`/leave-balances/:userId(\\d+)/:year(\\d+)`, AuthMiddleware, this.controller.getBalance);
    this.router.post(`/leave-balances`, AuthMiddleware, ValidationMiddleware(CreateLeaveBalanceDto), this.controller.createOrUpdateBalance);

    // Leave Requests CRUD
    this.router.get(`${this.path}`, AuthMiddleware, this.controller.getAll);
    this.router.get(`${this.path}/:id(\\d+)`, AuthMiddleware, this.controller.getById);
    this.router.post(`${this.path}`, AuthMiddleware, ValidationMiddleware(CreateLeaveRequestDto), this.controller.create);
    this.router.put(`${this.path}/:id(\\d+)/approve`, AuthMiddleware, this.controller.approve);
    this.router.put(`${this.path}/:id(\\d+)/reject`, AuthMiddleware, this.controller.reject);
    this.router.delete(`${this.path}/:id(\\d+)`, AuthMiddleware, this.controller.delete);
  }
}
