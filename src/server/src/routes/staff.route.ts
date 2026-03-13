import { Router } from 'express';

import multer from 'multer';
import { StaffController } from '@controllers/staff.controller';
import { CreateStaffProfileDto, UpdateStaffProfileDto } from '@dtos/staff.dto';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { RoleMiddleware } from '@middlewares/role.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';

// Use memory storage so we can pass buffer directly to service
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file Excel (.xlsx, .xls)'));
    }
  },
});

export class StaffRoute implements Routes {
  public path = '/staff';
  public router = Router();
  public controller = new StaffController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Statistics
    this.router.get(`${this.path}/statistics`, AuthMiddleware, RoleMiddleware('admin', 'manager'), this.controller.getStatistics);

    // Excel template download & import
    this.router.get(`${this.path}/excel/template`, AuthMiddleware, RoleMiddleware('admin', 'manager'), this.controller.downloadTemplate);
    this.router.get(`${this.path}/excel/export`, AuthMiddleware, RoleMiddleware('admin', 'manager'), this.controller.exportExcel);
    this.router.post(
      `${this.path}/excel/import`,
      AuthMiddleware,
      RoleMiddleware('admin', 'manager'),
      upload.single('file'),
      this.controller.importExcel,
    );

    // Get by user id
    this.router.get(`${this.path}/user/:userId(\\d+)`, AuthMiddleware, this.controller.getByUserId);

    // CRUD
    this.router.get(this.path, AuthMiddleware, RoleMiddleware('admin', 'manager'), this.controller.getAll);
    this.router.get(`${this.path}/:id(\\d+)`, AuthMiddleware, this.controller.getById);
    this.router.post(
      this.path,
      AuthMiddleware,
      RoleMiddleware('admin', 'manager'),
      ValidationMiddleware(CreateStaffProfileDto),
      this.controller.create,
    );
    this.router.put(
      `${this.path}/:id(\\d+)`,
      AuthMiddleware,
      RoleMiddleware('admin', 'manager'),
      ValidationMiddleware(UpdateStaffProfileDto, true),
      this.controller.update,
    );
    this.router.delete(`${this.path}/:id(\\d+)`, AuthMiddleware, RoleMiddleware('admin', 'manager'), this.controller.delete);  }
}
