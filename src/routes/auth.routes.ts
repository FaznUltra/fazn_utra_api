import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updatePassword,
  updateUserRole,
  getAllUsers,
  deactivateUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  verifyPasswordResetOTP,
  resetPassword
} from '../controllers/auth.controller';
import { protect, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  updatePasswordSchema,
  updateUserRoleSchema,
  verifyEmailSchema,
  resendVerificationEmailSchema,
  forgotPasswordSchema,
  verifyPasswordResetOTPSchema,
  resetPasswordSchema
} from '../validators/auth.validator';
import { UserRole } from '../types';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.post('/verify-email', validate(verifyEmailSchema), verifyEmail);
router.post('/resend-verification', validate(resendVerificationEmailSchema), resendVerificationEmail);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/verify-reset-otp', validate(verifyPasswordResetOTPSchema), verifyPasswordResetOTP);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

router.use(protect);

router.get('/me', getMe);
router.patch('/update-password', validate(updatePasswordSchema), updatePassword);

router.use(restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN));

router.get('/users', getAllUsers);
router.patch('/users/:userId/role', validate(updateUserRoleSchema), updateUserRole);
router.patch('/users/:userId/deactivate', deactivateUser);

export default router;
