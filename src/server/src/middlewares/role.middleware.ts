import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@interfaces/auth.interface';
import { HttpException } from '@exceptions/HttpException';

/**
 * Middleware to restrict access to specific roles.
 * Must be used AFTER AuthMiddleware.
 */
export const RoleMiddleware = (...allowedRoles: string[]) => {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpException(401, 'Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new HttpException(403, 'Bạn không có quyền thực hiện hành động này'));
    }

    next();
  };
};
