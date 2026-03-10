import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { RequestWithUser } from '@interfaces/auth.interface';
import { DeviceReportService } from '@services/device-reports.service';

export class DeviceReportController {
  public service = Container.get(DeviceReportService);

  public getAll = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const canSeeAll = user.role === 'admin' || user.role === 'technician';
      const reports = await this.service.findAll(canSeeAll ? undefined : user.id);
      res.status(200).json({ success: true, data: reports, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const report = await this.service.findById(id);
      res.status(200).json({ success: true, data: report, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const reporterId = req.user.id;
      const data: any = {
        deviceId: Number(req.body.deviceId),
        description: req.body.description,
      };

      if (req.file) {
        data.imageUrl = `/uploads/reports/${req.file.filename}`;
      }

      const report = await this.service.create(reporterId, data);
      res.status(201).json({ success: true, data: report, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const data: any = { ...req.body };

      if (req.file) {
        data.imageUrl = `/uploads/reports/${req.file.filename}`;
      }

      if (data.assignedTo) data.assignedTo = Number(data.assignedTo);

      const report = await this.service.update(id, data);
      res.status(200).json({ success: true, data: report, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const report = await this.service.delete(id);
      res.status(200).json({ success: true, data: report, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.service.getStats();
      res.status(200).json({ success: true, data: stats, message: 'stats' });
    } catch (error) {
      next(error);
    }
  };

  // ── Workflow endpoints ──

  public receive = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const userId = req.user.id;
      const report = await this.service.receive(id, userId);
      res.status(200).json({ success: true, data: report, message: 'received' });
    } catch (error) {
      next(error);
    }
  };

  public updateResult = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const { status, technicianNote } = req.body;
      const report = await this.service.updateResult(id, status, technicianNote);
      res.status(200).json({ success: true, data: report, message: 'resultUpdated' });
    } catch (error) {
      next(error);
    }
  };

  public confirm = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const userId = req.user.id;
      const { isWorking, description } = req.body;
      const report = await this.service.confirm(id, userId, isWorking, description);
      res.status(200).json({ success: true, data: report, message: 'confirmed' });
    } catch (error) {
      next(error);
    }
  };
}
