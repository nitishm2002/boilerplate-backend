import express from 'express';
import ValidationMiddleware from '../../middleware/validation.middleware';
import CustomerAuthController from '../../controller/common/auth.controller';
import * as AuthGard from '../../middleware/authGard.middleware';
import multer from 'multer';
import { singleProfileImageUpload } from '../../lib/fileUpload.utils';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  '/register',
  ValidationMiddleware.validate(ValidationMiddleware.schema.RegisterCred),
  CustomerAuthController.register,
);

router.post(
  '/login',
  ValidationMiddleware.validate(ValidationMiddleware.schema.LoginCred),
  CustomerAuthController.login,
);

router.post(
  '/logout',
  AuthGard.verifyUserAccessToken,
  ValidationMiddleware.validate(ValidationMiddleware.schema.LogoutCred),
  CustomerAuthController.logout,
);

router.post(
  '/verify-otp/:type',
  ValidationMiddleware.validate(ValidationMiddleware.schema.VerifyOTPCred),
  CustomerAuthController.verifyOTP,
);

router.post(
  '/resend-otp/:type',
  ValidationMiddleware.validate(ValidationMiddleware.schema.ResendOTPCred),
  CustomerAuthController.resendOTP,
);

router.get('/me', AuthGard.verifyUserAccessToken, CustomerAuthController.me);

router.post(
  '/forgot-password',
  ValidationMiddleware.validate(ValidationMiddleware.schema.ForgotPasswordCred),
  CustomerAuthController.forgotPassword,
);
router.post(
  '/change-password',
  ValidationMiddleware.validate(ValidationMiddleware.schema.ChangePasswordCred),
  CustomerAuthController.changePassword,
);

router.post(
  '/reset-password',
  AuthGard.verifyUserAccessToken,
  ValidationMiddleware.validate(ValidationMiddleware.schema.ResetPasswordCred),
  CustomerAuthController.resetPassword,
);
router.patch(
  '/update-profile',
  AuthGard.verifyUserAccessToken,
  upload.single('profile_image'),
  singleProfileImageUpload,
  ValidationMiddleware.validate(ValidationMiddleware.schema.UpdateProfile),
  CustomerAuthController.UpdateProfile,
);

// router.patch(
//   '/update-mobile-number/:user_type',
//   ValidationMiddleware.validate(ValidationMiddleware.schema.ChangeMobileCred),
//   CustomerAuthController.updateMobileNumber,
// );

// router.delete('/delete', AuthGard.verifyCustomerAccessToken, CustomerAuthController.deleteProfile);

export default router;
