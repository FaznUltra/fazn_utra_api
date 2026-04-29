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

    // Check if request is from mobile app
    const isMobile = req.get('user-agent')?.includes('Expo') || req.query.mobile === 'true';
    
    if (isMobile) {
      // For development with Expo Go, use exp:// scheme
      // For production, use custom scheme faznultra://
      const mobileRedirect = process.env.NODE_ENV === 'production'
        ? 'faznultra://auth/oauth-callback?success=true'
        : `${process.env.EXPO_REDIRECT_URL || 'exp://192.168.1.1:8081/--/auth/oauth-callback'}?success=true`;
      
      res.redirect(mobileRedirect);
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
      // For development with Expo Go, use exp:// scheme
      // For production, use custom scheme faznultra://
      const mobileRedirect = process.env.NODE_ENV === 'production'
        ? 'faznultra://auth/oauth-callback?success=true'
        : `${process.env.EXPO_REDIRECT_URL || 'exp://192.168.1.1:8081/--/auth/oauth-callback'}?success=true`;
      
      res.redirect(mobileRedirect);
    } else {
      // Redirect to web frontend
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
  } catch (error) {
    next(error);
  }
};
