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

      // Giáo viên và kỹ thuật viên chỉ xem công lệnh được giao cho mình
      const forceAssignedTo = ['teacher', 'technician'].includes(requester?.role) ? requester.id : undefined;

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

  public getById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const data = await this.service.findById(id);

      // Giáo viên và kỹ thuật viên chỉ xem được công lệnh được giao cho chính họ
      if (['teacher', 'technician'].includes(req.user.role) && data.assignedTo !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền xem công lệnh này' });
      }

      res.status(200).json({ success: true, data, message: 'OK' });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const isSelfAssignRole = ['teacher', 'technician'].includes(req.user.role);
      const dto: CreateWorkOrderDto = {
        ...req.body,
        assignedTo: isSelfAssignRole ? req.user.id : req.body.assignedTo,
      };
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

  public uploadEvidence = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn ảnh minh chứng' });
      }

      const fileUrl = `/uploads/work-orders/${req.file.filename}`;
      const data = await this.service.uploadEvidence(id, req.user.id, req.user.role, fileUrl);
      res.status(200).json({ success: true, data, message: 'Upload ảnh minh chứng thành công' });
    } catch (error) {
      next(error);
    }
  };

  public submitCompletion = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const data = await this.service.submitCompletion(id, req.user.id, req.user.role);
      res.status(200).json({ success: true, data, message: 'Đã gửi yêu cầu xác nhận hoàn thành' });
    } catch (error) {
      next(error);
    }
  };

  public confirmCompletion = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const data = await this.service.confirmCompletion(id, req.user.id);
      res.status(200).json({ success: true, data, message: 'Xác nhận hoàn thành công lệnh thành công' });
    } catch (error) {
      next(error);
    }
  };

  public requestRework = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
      const data = await this.service.requestRework(id, req.user.id, reason);
      res.status(200).json({ success: true, data, message: 'Đã yêu cầu thực hiện lại công lệnh' });
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
