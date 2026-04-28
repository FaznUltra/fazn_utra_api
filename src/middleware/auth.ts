import { Request, Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';
import { verifyToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import User from '../models/User';

export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access', 401));
    }

    const decoded = verifyToken(token);

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists', 401));
    }

    if (!currentUser.isActive) {
      return next(new AppError('Your account has been deactivated', 401));
    }

    (req as AuthRequest).user = {
      id: currentUser._id.toString(),
      email: currentUser.email,
      role: currentUser.role
    };

    next();
  } catch (error) {
    next(new AppError('Invalid token. Please log in again', 401));
  }
};

export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;
    if (!authReq.user || !roles.includes(authReq.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
