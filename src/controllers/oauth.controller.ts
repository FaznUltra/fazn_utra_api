import { Request, Response, NextFunction } from 'express';
import { generateToken } from '../utils/jwt';

export const googleCallback = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const user = req.user as any;

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
    }

    const token = generateToken(user._id.toString(), user.email, user.role);

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    next(error);
  }
};

export const twitchCallback = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const user = req.user as any;

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
    }

    const token = generateToken(user._id.toString(), user.email, user.role);

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    next(error);
  }
};
