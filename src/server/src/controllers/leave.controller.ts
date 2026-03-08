import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { RequestWithUser } from '@interfaces/auth.interface';
import { LeaveRequestService } from '@services/leave.service';
import { generateLeaveRequestPdf } from '@services/leave-pdf.service';

export class LeaveRequestController {
  public service = Container.get(LeaveRequestService);

  public getAll = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const isAdminOrManager = req.user.role === 'admin' || req.user.role === 'manager';
      const requests = await this.service.findAll(isAdminOrManager ? undefined : req.user.id);
      res.status(200).json({ success: true, data: requests, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const request = await this.service.findById(id);
      res.status(200).json({ success: true, data: request, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const data = req.body;
      const request = await this.service.create(userId, data);
      res.status(201).json({ success: true, data: request, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public approve = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const approvedBy = req.user.id;
      const { pin } = req.body;
      const request = await this.service.approve(id, approvedBy, pin);
      res.status(200).json({ success: true, data: request, message: 'approved' });
    } catch (error) {
      next(error);
    }
  };

  public reject = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const approvedBy = req.user.id;
      const { rejectedReason, pin } = req.body;
      const request = await this.service.reject(id, approvedBy, pin, rejectedReason);
      res.status(200).json({ success: true, data: request, message: 'rejected' });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const request = await this.service.delete(id);
      res.status(200).json({ success: true, data: request, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public getStats = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const isAdminOrManager = req.user.role === 'admin' || req.user.role === 'manager';
      const stats = await this.service.getStats(isAdminOrManager ? undefined : req.user.id);
      res.status(200).json({ success: true, data: stats, message: 'stats' });
    } catch (error) {
      next(error);
    }
  };

  // ── Leave Types ──
  public getLeaveTypes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const types = await this.service.findAllTypes();
      res.status(200).json({ success: true, data: types, message: 'findAllTypes' });
    } catch (error) {
      next(error);
    }
  };

  public createLeaveType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const type = await this.service.createType(data);
      res.status(201).json({ success: true, data: type, message: 'typeCreated' });
    } catch (error) {
      next(error);
    }
  };

  // ── Leave Balances ──
  public getBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.params.userId);
      const year = Number(req.params.year);
      const balance = await this.service.getBalance(userId, year);
      res.status(200).json({ success: true, data: balance, message: 'balance' });
    } catch (error) {
      next(error);
    }
  };

  public createOrUpdateBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const balance = await this.service.createOrUpdateBalance(data);
      res.status(200).json({ success: true, data: balance, message: 'balanceUpdated' });
    } catch (error) {
      next(error);
    }
  };

  // ── Sign Leave Request ──
  public sign = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const userId = req.user.id;
      const { pin } = req.body;
      const result = await this.service.signRequest(id, userId, pin);
      res.status(200).json({ success: true, data: result, message: 'signed' });
    } catch (error) {
      next(error);
    }
  };

  // ── PDF Export ──
  public exportPdf = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const pdfBuffer = await generateLeaveRequestPdf(id);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="don-xin-nghi-phep-${id}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  };
}
