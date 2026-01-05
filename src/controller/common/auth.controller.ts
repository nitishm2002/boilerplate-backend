import { Request, Response } from 'express';
import * as Utils from '../../lib/utils';
import authService from '../../services/common/auth.service';
import {
  ChangeEmailData,
  ChangeEmailVerifyOTPData,
  ChangePasswordData,
  ResetPasswordData,
  ForgotPasswordData,
  IRequest,
  LoginData,
  LogoutData,
  RegisterData,
  VerifyOTPData,
} from '../../lib/common.interface';

export default new (class AuthController {
  register = (req: IRequest, res: Response): void => {
    try {
      const body = req.body as Record<string, string>;
      const serviceCategory = Array.isArray(body.service_category)
        ? (body.service_category as number[])
        : [];

      const args: RegisterData = {
        name: body.name,
        email: body.email,
        password: body.password,
        role: body.role,
        service_category: serviceCategory,
      };

      authService
        .register(args)
        .then((result) => {
          res.status(Utils.statusCode.OK).send(Utils.sendSuccessResponse(result));
        })
        .catch((err) => {
          res
            .status(Utils.getErrorStatusCode(err))
            .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
        });
    } catch (err) {
      res
        .status(Utils.getErrorStatusCode(err))
        .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
    }
  };

  login = (req: IRequest, res: Response): void => {
    try {
      const body = req.body as Record<string, string>;
      const args: LoginData = {
        email: body.email,
        password: body.password,
        fcm_token: body.fcm_token,
      };

      authService
        .login(args)
        .then((result) => {
          res.status(Utils.statusCode.OK).send(Utils.sendSuccessResponse(result));
        })
        .catch((err) => {
          res
            .status(Utils.getErrorStatusCode(err))
            .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
        });
    } catch (err) {
      res
        .status(Utils.getErrorStatusCode(err))
        .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
    }
  };

  logout = (req: IRequest, res: Response): void => {
    try {
      const body = req.body as Record<string, string>;
      const token = req.token;
      const userId = req.user?.id;
      // const args: LogoutData = {
      //   // fcm_token: body.fcm_token,
      //   // user_type: body.user_type,
      // };

      authService
        .logout(userId, token)
        .then((result) => {
          res.status(Utils.statusCode.OK).send(Utils.sendSuccessResponse(result));
        })
        .catch((err) => {
          res
            .status(Utils.getErrorStatusCode(err))
            .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
        });
    } catch (err) {
      res
        .status(Utils.getErrorStatusCode(err))
        .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
    }
  };

  forgotPassword = (req: IRequest, res: Response): void => {
    try {
      const body = req.body as Record<string, string>;
      const args: ForgotPasswordData = {
        email: body.email.toLowerCase(),
      };
      // const role = req.user.role;

      authService
        .forgotPassword(args)
        .then((result) => {
          res.status(Utils.statusCode.OK).send(Utils.sendSuccessResponse(result));
        })
        .catch((err) => {
          res
            .status(Utils.getErrorStatusCode(err))
            .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
        });
    } catch (err) {
      res
        .status(Utils.getErrorStatusCode(err))
        .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
    }
  };

  changePassword = (req: IRequest, res: Response): void => {
    try {
      const body = req.body as Record<string, string>;
      const args: ChangePasswordData = {
        email: body.email.toLowerCase(),
        password: body.password,
      };

      authService
        .changePassword(args)
        .then((result) => {
          res.status(Utils.statusCode.OK).send(Utils.sendSuccessResponse(result));
        })
        .catch((err) => {
          res
            .status(Utils.getErrorStatusCode(err))
            .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
        });
    } catch (err) {
      res
        .status(Utils.getErrorStatusCode(err))
        .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
    }
  };

  resetPassword = (req: IRequest, res: Response): void => {
    try {
      const body = req.body as Record<string, string>;
      const args: ResetPasswordData = {
        password: body.password,
      };

      authService
        .resetPassword(args, req.user.id)
        .then((result) => {
          res.status(Utils.statusCode.OK).send(Utils.sendSuccessResponse(result));
        })
        .catch((err) => {
          res
            .status(Utils.getErrorStatusCode(err))
            .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
        });
    } catch (err) {
      res
        .status(Utils.getErrorStatusCode(err))
        .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
    }
  };

  changeEmail = (req: IRequest, res: Response): void => {
    try {
      const body = req.body as Record<string, string>;
      const args: ChangeEmailData = {
        email: body.email.toLowerCase(),
      };

      authService
        .changeEmail(args)
        .then((result) => {
          res.status(Utils.statusCode.OK).send(Utils.sendSuccessResponse(result));
        })
        .catch((err) => {
          res
            .status(Utils.getErrorStatusCode(err))
            .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
        });
    } catch (err) {
      res
        .status(Utils.getErrorStatusCode(err))
        .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
    }
  };

  changeEmailVerifyOTP = (req: IRequest, res: Response): void => {
    try {
      const body = req.body as Record<string, string>;
      const args: ChangeEmailVerifyOTPData = {
        current_email: body.current_email.toLowerCase(),
        new_email: body.new_email.toLowerCase(),
        otp: body.otp,
      };

      authService
        .changeEmailVerifyOTP(args)
        .then((result) => {
          res.status(Utils.statusCode.OK).send(Utils.sendSuccessResponse(result));
        })
        .catch((err) => {
          res
            .status(Utils.getErrorStatusCode(err))
            .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
        });
    } catch (err) {
      res
        .status(Utils.getErrorStatusCode(err))
        .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
    }
  };

  me = (req: IRequest, res: Response): void => {
    try {
      const userId = req.user.id;
      authService
        .me(userId)
        .then((result) => {
          res.status(Utils.statusCode.OK).send(Utils.sendSuccessResponse(result));
        })
        .catch((err) => {
          res
            .status(Utils.getErrorStatusCode(err))
            .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
        });
    } catch (err) {
      res
        .status(Utils.getErrorStatusCode(err))
        .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
    }
  };

  verifyOTP = (req: IRequest, res: Response): void => {
    try {
      const body = req.body as Record<string, string>;
      const otp_type = req.params.type;
      console.log('otp_type: ', otp_type);
      const args: VerifyOTPData = {
        email: body.email,
        otp_type,
        otp: body.otp,
      };

      authService
        .verifyOTP(args)
        .then((result) => {
          res.status(Utils.statusCode.OK).send(Utils.sendSuccessResponse(result));
        })
        .catch((err) => {
          res
            .status(Utils.getErrorStatusCode(err))
            .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
        });
    } catch (err) {
      res
        .status(Utils.getErrorStatusCode(err))
        .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
    }
  };

  resendOTP = (req: IRequest, res: Response): void => {
    try {
      const body = req.body as Record<string, string>;
      const otp_type = req.params.type as 'register' | 'forgot_password';

      const args: Record<string, string> = {
        email: body.email,
        otp_type,
      };

      authService
        .resendOtp(args)
        .then((result) => {
          res.status(Utils.statusCode.OK).send(Utils.sendSuccessResponse(result));
        })
        .catch((err) => {
          res
            .status(Utils.getErrorStatusCode(err))
            .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
        });
    } catch (err) {
      res
        .status(Utils.getErrorStatusCode(err))
        .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
    }
  };

  UpdateProfile = (req: IRequest, res: Response) => {
    try {
      authService
        .updateProfile(req.body, req.user.id)
        .then((result) => res.status(Utils.statusCode.OK).send(Utils.sendSuccessResponse(result)))
        .catch((err) =>
          res
            .status(Utils.getErrorStatusCode(err))
            .send(Utils.sendErrorResponse(Utils.getErrorMsg(err))),
        );
    } catch (err) {
      res
        .status(Utils.getErrorStatusCode(err))
        .send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
    }
  };
})();
