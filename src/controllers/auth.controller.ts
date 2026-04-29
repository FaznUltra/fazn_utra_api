import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { UserRole, asAuthRequest } from '../types';
import { generateToken, sendTokenResponse } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { generateOTP, getOTPExpiry } from '../utils/otp';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../utils/email';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, username } = req.body;

    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return next(new AppError('Email already registered', 400));
      }
      if (existingUser.username === username) {
        return next(new AppError('Username already taken', 400));
      }
    }

    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      username,
      role: UserRole.USER,
      emailVerificationOTP: otp,
      emailVerificationOTPExpires: otpExpiry
    });

    await sendVerificationEmail(email, otp, firstName);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification code.',
      userId: user._id
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated', 401));
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id.toString(), user.email, user.role);

    sendTokenResponse(res, 200, token, {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.cookie('token', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = asAuthRequest(req);
    const user = await User.findById(authReq.user?.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const authReq = asAuthRequest(req);

    const user = await User.findById(authReq.user?.id).select('+password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (!(await user.comparePassword(currentPassword))) {
      return next(new AppError('Current password is incorrect', 401));
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id.toString(), user.email, user.role);

    sendTokenResponse(res, 200, token, {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const authReq = asAuthRequest(req);

    if (authReq.user?.id === userId) {
      return next(new AppError('You cannot change your own role', 400));
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      return next(new AppError('Cannot modify super admin role', 403));
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await User.find().sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const authReq = asAuthRequest(req);

    if (authReq.user?.id === userId) {
      return next(new AppError('You cannot deactivate your own account', 400));
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      return next(new AppError('Super admin accounts cannot be deactivated', 403));
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId).select('+emailVerificationOTP +emailVerificationOTPExpires');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.isEmailVerified) {
      return next(new AppError('Email already verified', 400));
    }

    if (!user.emailVerificationOTP || !user.emailVerificationOTPExpires) {
      return next(new AppError('No verification code found. Please request a new one.', 400));
    }

    if (user.emailVerificationOTPExpires < new Date()) {
      return next(new AppError('Verification code has expired. Please request a new one.', 400));
    }

    if (user.emailVerificationOTP !== otp) {
      return next(new AppError('Invalid verification code', 400));
    }

    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.firstName);

    const token = generateToken(user._id.toString(), user.email, user.role);

    sendTokenResponse(res, 200, token, {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.isEmailVerified) {
      return next(new AppError('Email already verified', 400));
    }

    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpires = otpExpiry;
    await user.save();

    await sendVerificationEmail(user.email, otp, user.firstName);

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email'
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError('No user found with that email address', 404));
    }

    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    user.passwordResetOTP = otp;
    user.passwordResetOTPExpires = otpExpiry;
    await user.save();

    await sendPasswordResetEmail(user.email, otp, user.firstName);

    res.status(200).json({
      success: true,
      message: 'Password reset code sent to your email',
      userId: user._id
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPasswordResetOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId).select('+passwordResetOTP +passwordResetOTPExpires');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (!user.passwordResetOTP || !user.passwordResetOTPExpires) {
      return next(new AppError('No reset code found. Please request a new one.', 400));
    }

    if (user.passwordResetOTPExpires < new Date()) {
      return next(new AppError('Reset code has expired. Please request a new one.', 400));
    }

    if (user.passwordResetOTP !== otp) {
      return next(new AppError('Invalid reset code', 400));
    }

    res.status(200).json({
      success: true,
      message: 'Code verified successfully. You can now reset your password.',
      userId: user._id
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, otp, newPassword } = req.body;

    const user = await User.findById(userId).select('+passwordResetOTP +passwordResetOTPExpires +password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (!user.passwordResetOTP || !user.passwordResetOTPExpires) {
      return next(new AppError('No reset code found. Please request a new one.', 400));
    }

    if (user.passwordResetOTPExpires < new Date()) {
      return next(new AppError('Reset code has expired. Please request a new one.', 400));
    }

    if (user.passwordResetOTP !== otp) {
      return next(new AppError('Invalid reset code', 400));
    }

    user.password = newPassword;
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    await user.save();

    const token = generateToken(user._id.toString(), user.email, user.role);

    sendTokenResponse(res, 200, token, {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    next(error);
  }
};
