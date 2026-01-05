import Joi from 'joi';
import * as Utils from '../lib/utils';

// Import types for accurate typing
import { Request, Response, NextFunction } from 'express';
import {
  RegisterData,
  LoginData,
  VerifyOTPData,
  ForgotPasswordData,
  ChangePasswordData,
  ResetPasswordData,
  ChangeEmailData,
  ChangeEmailVerifyOTPData,
  LogoutData,
  CreateJobData,
  SubmitBidData,
  AcceptBidData,
  SwipeData,
  RatingData,
  ICreateChat,
  ISendMessage,
  IChangeJobStatus,
} from '../lib/common.interface';

interface ValidationMiddleware {
  validate: (schema: Joi.Schema) => (req: Request, res: Response, next: NextFunction) => void;
  schema: {
    RegisterCred: Joi.ObjectSchema;
    LoginCred: Joi.ObjectSchema;
    LogoutCred: Joi.ObjectSchema;
    ForgotPasswordCred: Joi.ObjectSchema;
    VerifyOTPCred: Joi.ObjectSchema;
    ResendOTPCred: Joi.ObjectSchema;
    ChangePasswordCred: Joi.ObjectSchema;
    ResetPasswordCred: Joi.ObjectSchema;
    ChangeEmailCred: Joi.ObjectSchema;
    ChangeEmailVerifyOTPCred: Joi.ObjectSchema;
    UpdateProfile: Joi.ObjectSchema;
    CreateJobCategoryCred: Joi.ObjectSchema;
    UpdateJobCategoryCred: Joi.ObjectSchema;
    CreateJobCred: Joi.ObjectSchema;
    SubmitBidCred: Joi.ObjectSchema;
    EditBidCred: Joi.ObjectSchema;
    AcceptBidCred: Joi.ObjectSchema;
    SwipeCred: Joi.ObjectSchema;
    CreateRatingCred: Joi.ObjectSchema;
    CreateChat: Joi.ObjectSchema;
    SendMessage: Joi.ObjectSchema;
    ChangeJobStatus: Joi.ObjectSchema;
  };
}

const validationMiddleware: ValidationMiddleware = {
  validate: (schema: Joi.Schema) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!schema) {
        return next();
      }

      const validationOptions = {
        errors: {
          wrap: { label: '' },
        },
        abortEarly: false,
      };

      const data: Record<string, unknown> =
        req.method === 'GET'
          ? (req.query as Record<string, unknown>)
          : (req.body as Record<string, unknown>);

      (schema as Joi.ObjectSchema<unknown>)
        .validateAsync(data, validationOptions)
        .then((result) => {
          req.body = result as Record<string, unknown>;
          next();
        })
        .catch((error) => {
          if (error instanceof Joi.ValidationError) {
            res
              .status(Utils.statusCode.UNPROCESSABLE_ENTITY)
              .send(Utils.sendErrorResponse(Utils.getErrorMsg(error.message)));
          } else {
            next(error);
          }
        });
    };
  },

  schema: {
    RegisterCred: Joi.object<RegisterData>().keys({
      name: Joi.string().trim().required(),
      email: Joi.string().trim().lowercase().email().required(),
      password: Joi.string().trim().required(),
      service_category: Joi.array().items(Joi.number().integer().positive()).default([]),
      role: Joi.string().trim().required(),
    }),
    LoginCred: Joi.object<LoginData>().keys({
      fcm_token: Joi.string().allow('', null).optional(),
      email: Joi.string().trim().lowercase().email().required(),
      password: Joi.string().trim().required(),
    }),

    ForgotPasswordCred: Joi.object<ForgotPasswordData>().keys({
      email: Joi.string().trim().lowercase().email().required(),
    }),

    VerifyOTPCred: Joi.object<VerifyOTPData>().keys({
      email: Joi.string().trim().lowercase().email().required(),
      otp: Joi.string().required(),
    }),

    ChangePasswordCred: Joi.object<ChangePasswordData>().keys({
      email: Joi.string().trim().lowercase().email().required(),
      password: Joi.string().trim().required(),
    }),

    ResetPasswordCred: Joi.object<ResetPasswordData>().keys({
      password: Joi.string().trim().min(6).required(),
    }),

    ChangeEmailCred: Joi.object<ChangeEmailData>().keys({
      email: Joi.string().trim().lowercase().email().required(),
    }),

    ChangeEmailVerifyOTPCred: Joi.object<ChangeEmailVerifyOTPData>().keys({
      current_email: Joi.string().trim().lowercase().email().required(),
      new_email: Joi.string().trim().lowercase().email().required(),
      otp: Joi.string().trim().required(),
    }),
    LogoutCred: Joi.object<LogoutData>().keys({
      fcm_token: Joi.string().allow('', null).optional(),
    }),
    ResendOTPCred: Joi.object().keys({
      email: Joi.string().trim().lowercase().email().required(),
    }),
    UpdateProfile: Joi.object().keys({
      name: Joi.string().trim().allow('', null).optional(),
      service_category: Joi.string().trim().allow('', null).optional(),
      profile_image: Joi.string().trim().allow('', null).optional(),
    }),
    CreateJobCategoryCred: Joi.object().keys({
      name: Joi.string().trim().required(),
    }),
    UpdateJobCategoryCred: Joi.object().keys({
      name: Joi.string().trim().required(),
    }),
    CreateJobCred: Joi.object<CreateJobData>().keys({
      title: Joi.string().trim().required(),
      description: Joi.string().trim().required(),
      category_id: Joi.number().integer().positive().required(),
      project_size: Joi.string().trim().required(),
      budget_min: Joi.number().positive().optional(),
      budget_max: Joi.number().positive().optional(),
      work_finish_type: Joi.string().required(),
      work_finish_from: Joi.date().optional(),
      work_finish_to: Joi.date().optional(),
      location: Joi.string().trim().required(),
      images: Joi.array().items(Joi.string()).optional(),
    }),
    SubmitBidCred: Joi.object<SubmitBidData>().keys({
      amount: Joi.number().positive().required(),
      message: Joi.string().trim().required(),
      currency: Joi.string().trim().required(),
    }),
    EditBidCred: Joi.object<SubmitBidData>().keys({
      amount: Joi.number().positive().optional().allow(null, ''),
      message: Joi.string().trim().optional().allow(null, ''),
      currency: Joi.string().trim().optional().allow(null, ''),
    }),
    AcceptBidCred: Joi.object<AcceptBidData>().keys({
      bid_id: Joi.number().integer().positive().required(),
      status: Joi.string().trim().valid('accept', 'reject').required(),
    }),

    SwipeCred: Joi.object<SwipeData>().keys({
      job_id: Joi.number().integer().positive().required(),
      professional_id: Joi.number().integer().positive().required(),
    }),
    CreateRatingCred: Joi.object<RatingData>().keys({
      job_id: Joi.number().integer().positive().required(),
      professional_id: Joi.number().integer().positive().optional(),
      rating: Joi.number().min(0).max(5).required(),
    }),
    CreateChat: Joi.object<ICreateChat>().keys({
      job_id: Joi.number().integer().positive().required(),
      receiver_id: Joi.number().integer().positive().required(),
    }),
    SendMessage: Joi.object<ISendMessage>().keys({
      chat_id: Joi.string().trim().required(),
      message: Joi.string().required().trim(),
    }),
    ChangeJobStatus: Joi.object<IChangeJobStatus>().keys({
      action: Joi.string().trim().required().valid('start', 'complete'),
    }),
  },
};

export default validationMiddleware;
