import { Request, Response, NextFunction } from 'express';
import { generateToken } from '../utils/jwt';

export const googleCallback = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const user = req.user as any;

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
    }

    const token = generateToken(user._id.toString(), user.email, user.role);

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Check if request is from mobile app (has custom scheme in referer or user agent)
    const isMobile = req.get('user-agent')?.includes('Expo') || req.query.mobile === 'true';
    
    if (isMobile) {
      // Redirect to mobile app custom scheme
      res.redirect(`faznultra://auth/oauth-callback?success=true`);
    } else {
      // Redirect to web frontend
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
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

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Check if request is from mobile app
    const isMobile = req.get('user-agent')?.includes('Expo') || req.query.mobile === 'true';
    
    if (isMobile) {
      // Redirect to mobile app custom scheme
      res.redirect(`faznultra://auth/oauth-callback?success=true`);
    } else {
      // Redirect to web frontend
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
  } catch (error) {
    next(error);
  }
};
