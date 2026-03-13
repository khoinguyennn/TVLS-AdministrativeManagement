import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { RequestWithUser } from '@interfaces/auth.interface';
import { WorkOrderService } from '@services/work-orders.service';
import { CreateWorkOrderDto, UpdateWorkOrderDto } from '@dtos/work-orders.dto';

export class WorkOrderController {
  public service = Container.get(WorkOrderService);

  public getAll = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { status, assignedTo, createdBy } = req.query;
      const requester = req.user;

      // Giáo viên chỉ xem công lệnh được giao cho mình
      const forceAssignedTo = requester?.role === 'teacher' ? requester.id : undefined;

      const data = await this.service.findAll({
        status: status as string,
        assignedTo: forceAssignedTo ?? (assignedTo ? Number(assignedTo) : undefined),
        createdBy: createdBy ? Number(createdBy) : undefined,
      });
      res.status(200).json({ success: true, data, message: 'OK' });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const data = await this.service.findById(id);
      res.status(200).json({ success: true, data, message: 'OK' });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const dto: CreateWorkOrderDto = req.body;
      const data = await this.service.create(dto, req.user.id);
      res.status(201).json({ success: true, data, message: 'Tạo công lệnh thành công' });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const dto: UpdateWorkOrderDto = req.body;
      const data = await this.service.update(id, dto, req.user.id, req.user.role);
      res.status(200).json({ success: true, data, message: 'Cập nhật công lệnh thành công' });
    } catch (error) {
      next(error);
    }
  };

  public approve = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const data = await this.service.approve(id, req.user.id);
      res.status(200).json({ success: true, data, message: 'Phê duyệt công lệnh thành công' });
    } catch (error) {
      next(error);
    }
  };

  public reject = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const data = await this.service.reject(id, req.user.id);
      res.status(200).json({ success: true, data, message: 'Từ chối công lệnh thành công' });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      await this.service.delete(id, req.user.id, req.user.role);
      res.status(200).json({ success: true, message: 'Xóa công lệnh thành công' });
    } catch (error) {
      next(error);
    }
  };
}
