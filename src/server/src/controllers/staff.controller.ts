import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { StaffService } from '@services/staff.service';
import { CreateStaffProfileDto, UpdateStaffProfileDto } from '@dtos/staff.dto';

export class StaffController {
  public service = Container.get(StaffService);

  public getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.findAll();
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

  public getByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.params.userId);
      const data = await this.service.findByUserId(userId);
      res.status(200).json({ success: true, data, message: 'OK' });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: CreateStaffProfileDto = req.body;
      const data = await this.service.create(dto);
      res.status(201).json({ success: true, data, message: 'Tạo hồ sơ nhân sự thành công' });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const dto: UpdateStaffProfileDto = req.body;
      const data = await this.service.update(id, dto);
      res.status(200).json({ success: true, data, message: 'Cập nhật hồ sơ nhân sự thành công' });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      await this.service.delete(id);
      res.status(200).json({ success: true, message: 'Xóa hồ sơ nhân sự thành công' });
    } catch (error) {
      next(error);
    }
  };

  public exportExcel = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const buffer = await this.service.exportExcel();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="ho-so-nhan-su.xlsx"');
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  };

  public downloadTemplate = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const buffer = this.service.generateImportTemplate();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="mau-nhap-ho-so.xlsx"');
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  };

  public importExcel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'Vui lòng upload file Excel' });
        return;
      }
      const result = await this.service.importExcel(req.file.buffer);
      res.status(200).json({
        success: true,
        data: result,
        message: `Nhập thành công ${result.success} hồ sơ`,
      });
    } catch (error) {
      next(error);
    }
  };
}
