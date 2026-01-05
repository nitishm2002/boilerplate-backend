import {
  ChangeEmailData,
  ChangeEmailVerifyOTPData,
  ChangePasswordData,
  ResetPasswordData,
  VerifyOTPData,
  ForgotPasswordData,
  LoginData,
  LogoutData,
  RegisterData,
} from '../../lib/common.interface';
import { Op } from 'sequelize';
import * as Utils from '../../lib/utils';
import * as JwtUtils from '../../lib/jwt.utils';
import RedisHelper from '../../lib/redis.helper';
import * as HashUtils from '../../lib/hash.utils';
import generateOTP from '../../utils/generateOTP';
import { removeFileFromS3 } from '../../lib/aws.utils';
import { SuccessMsg, ErrorMsg, OTPType, AccountStatus, UserType } from '../../lib/constants';
import { IUser, User } from '../../models/user.model';
import { handleOTP } from '../../lib/saveOTP';
import { sendAccountVerifyOtp, sendPasswordResetOTP } from '../../utils/sendEmail';
import { IToken, Token } from '../../models/token.model';
import AWSUtils from '../../config/aws.config';
import { JobCategory } from '../../models/jobCategory.model';
import { AcceptedJob, Job } from '../../models';

export default new (class AuthService {
  async register(args: RegisterData) {
    const { name, email, password, role, service_category } = args;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: { [Op.iLike]: email } },
    });

    if (existingUser) {
      Utils.throwError(ErrorMsg.USER.alreadyExists);
    }

    // Hash password
    const hashedPassword = await HashUtils.generateHash(password);

    const payload: any = {
      name,
      email,
      password: hashedPassword,
      role,
      account_status: AccountStatus.STATUS.PENDING,
    };

    let serviceCategoryResponse: Array<{ id: number; name: string }> = [];

    // ------------------------------------------------------------------
    // ⭐ Professional: validate + fetch category names
    // ------------------------------------------------------------------
    if (role === 'professional') {
      if (!Array.isArray(service_category) || service_category.length === 0) {
        Utils.throwError('Service category must be a non-empty array for professionals.');
      }

      // Fetch category id + name
      const categories = await JobCategory.findAll({
        where: { id: service_category },
        attributes: ['id', 'name'],
      });

      if (categories.length !== service_category.length) {
        Utils.throwError('One or more category IDs are invalid.');
      }

      // Build response: { id, name }
      serviceCategoryResponse = categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
      }));

      // Save only IDs in DB
      payload.service_category = service_category;
    }

    // Create user
    const newUser = await User.create(payload);

    // Generate OTP and send email
    const OTP = generateOTP();
    await handleOTP(newUser.id, OTPType.TYPE.register, OTP, role, email);
    await sendAccountVerifyOtp(newUser, OTP);

    // ----------------------------------------------------
    // ⭐ Final response: service_category as array of objects
    // ----------------------------------------------------
    return {
      message: SuccessMsg.AUTH.sendOtp,
      OTP,
      user: {
        ...newUser.toJSON(),
        service_category: serviceCategoryResponse, // ⭐ final format
      },
    };
  }

  async login(args: LoginData) {
    // Find user by email
    let customer = await User.findOne({
      where: { email: { [Op.iLike]: args.email } },
      raw: true,
    });

    if (!customer) {
      Utils.throwError(ErrorMsg.USER.notFound);
    }

    // Password check
    const passwordMatch = await HashUtils.compareHash(args.password, customer.password);

    if (!passwordMatch) {
      Utils.throwError(ErrorMsg.USER.incorrectCredentials);
    }

    // Manage FCM token storage
    const fcmToken = args.fcm_token; // Token from request
    // let existingTokens = customer.fcm_token || [];

    // if (!existingTokens.includes(fcmToken)) {
    //   existingTokens.push(fcmToken);
    //   await User.update({ fcm_token: existingTokens }, { where: { id: customer.id } });
    // }

    const isValidToken = typeof fcmToken === 'string' && fcmToken.trim().length > 0;

    if (isValidToken) {
      let existingTokens = Array.isArray(customer.fcm_token) ? customer.fcm_token : [];

      if (!existingTokens.includes(fcmToken)) {
        existingTokens.push(fcmToken);

        await User.update({ fcm_token: existingTokens }, { where: { id: customer.id } });
      }
    }

    const jwtToken = await JwtUtils.createToken({
      id: customer.id,
      email: customer.email,
      type: customer.role,
    });

    await RedisHelper.sAdd(`${customer.role}:${customer.id}.token`, jwtToken);
    let serviceCategoryResponse: Array<{ id: number; name: string }> = [];

    if (customer.role === UserType.TYPE.professional && Array.isArray(customer.service_category)) {
      const categories = await JobCategory.findAll({
        where: { id: customer.service_category },
        attributes: ['id', 'name'],
      });

      serviceCategoryResponse = categories.map((c: any) => ({
        id: c.id,
        name: c.name,
      }));
    }

    return {
      message: SuccessMsg.AUTH.login, // You can rename as needed
      token: jwtToken,
      user: {
        ...customer,
        service_category: serviceCategoryResponse,
      },
    };
  }

  async logout(userId: number, token: string) {
    const user = await User.findOne({
      where: { id: userId },
    });

    // if (user && user.fcm_token && args.fcm_token) {
    //   const updatedTokens = user.fcm_token.filter((token: string) => token !== args.fcm_token);

    //   await User.update({ fcm_token: updatedTokens }, { where: { id: userId } });
    // }
    await RedisHelper.sRem(`${user.role}:${user.id}.token`, token);

    return {
      message: SuccessMsg.USER.logout,
    };
  }

  async forgotPassword(args: ForgotPasswordData) {
    // Find user by email
    const user: IUser = await User.findOne({
      where: { email: args.email },
    });

    if (!user) {
      Utils.throwError(ErrorMsg.USER.emailNotFound);
    }

    const userId = user.id;
    const OTP = generateOTP();

    // Send OTP
    await sendPasswordResetOTP(user, OTP);

    // Check existing token
    const existingToken = await Token.findOne({
      where: {
        user_id: userId,
        otp_type: OTPType.TYPE.forgotPassword,
      },
    });

    // Update or create token
    if (existingToken) {
      await existingToken.update({ otp: OTP });
    } else {
      await Token.create({
        user_id: user.id,
        email: user.email,
        otp_type: OTPType.TYPE.forgotPassword,
        otp: OTP,
      });
    }

    return {
      message: SuccessMsg.USER.sendOtp,
      otp: OTP,
    };
  }

  async changePassword(args: ChangePasswordData) {
    const password = await HashUtils.generateHash(args.password);
    const [updatedCount, updatedUsers] = await User.update(
      { password },
      {
        where: { email: args.email },
        returning: true,
      },
    );

    if (updatedCount === 0 || !updatedUsers?.length) {
      Utils.throwError(ErrorMsg.USER.emailNotFound);
    }

    const user = updatedUsers[0];
    const jwtToken = await JwtUtils.createToken({
      id: user.id,
      email: user.email,
      type: user.role,
    });

    await RedisHelper.sAdd(`${user.role}:${user.id}.token`, jwtToken);

    return {
      message: SuccessMsg.AUTH.passwordChange,
      token: jwtToken,
    };
  }

  async me(userId: number) {
    const user: IUser = await User.findOne({
      where: { id: userId },
      raw: true,
    });
    let serviceCategoryResponse: Array<{ id: number; name: string }> = [];

    if (user.role === 'professional' && Array.isArray(user.service_category)) {
      const categories = await JobCategory.findAll({
        where: { id: user.service_category },
        attributes: ['id', 'name'],
      });

      serviceCategoryResponse = categories.map((c: any) => ({
        id: c.id,
        name: c.name,
      }));
    }

    let job_count;

    if (user.role === UserType.TYPE.customer) {
      job_count = await Job.count({ where: { customer_id: userId } });
    } else {
      job_count = await AcceptedJob.count({
        where: { professional_id: userId },
        include: [
          {
            model: Job,
            required: true,
            as: 'job',
            attributes: ['id', 'title', 'description', 'status'],
            where: { status: 'completed' },
          },
        ],
      });
    }

    if (!user) Utils.throwError(ErrorMsg.USER.notFound);

    return {
      message: SuccessMsg.AUTH.profile,
      user: {
        ...user,
        service_category: serviceCategoryResponse, // ⭐ final response
        job_count,
      },
    };
  }

  async verifyOTP(args: VerifyOTPData) {
    const token = await this.getToken(args);

    if (!token || !(await this.compareOtp(args, token))) {
      Utils.throwError(ErrorMsg.USER.incorrectOTP);
    }

    const userId = token.user_id;

    // Handle register verification
    if (args.otp_type === OTPType.TYPE.register) {
      return await this.verifyRegisterOTP(userId);
    }

    // Handle forgot password verification
    if (args.otp_type === OTPType.TYPE.forgotPassword) {
      return await this.verifyForgotPasswordOTP(userId);
    }
  }

  async updateProfile(args: Record<string, unknown>, userId: number) {
    const oldUser: IUser = await User.findOne({ where: { id: userId } });
    if (!oldUser) {
      Utils.throwError(ErrorMsg.USER.notFound);
    }

    await User.update(args, { where: { id: userId } });

    const updatedUser: IUser = await User.findOne({ where: { id: userId } });
    if (oldUser.profile_image && oldUser.profile_image !== updatedUser.profile_image) {
      await removeFileFromS3({
        Bucket: AWSUtils.s3BucketName,
        Key: oldUser.profile_image.replace('/profile_image/', 'profile_image/'),
      });
    }

    return {
      message: SuccessMsg.AUTH.profileUpdate,
      user: updatedUser,
    };
  }

  async getToken(args: VerifyOTPData): Promise<IToken | null> {
    return Token.findOne({
      where: {
        email: args.email,
        otp_type: args.otp_type,
      },
    });
  }

  async compareOtp(args: VerifyOTPData, token: IToken): Promise<boolean> {
    return Boolean(await HashUtils.compareHash(args.otp, token.otp));
  }

  async verifyRegisterOTP(userId: number) {
    await Token.destroy({
      where: {
        user_id: userId,
        otp_type: OTPType.TYPE.register,
      },
    });
    await User.update({ is_verified: true, account_status: 'active' }, { where: { id: userId } });

    return {
      message: SuccessMsg.USER.verifyOTP,
    };
  }

  async verifyForgotPasswordOTP(userId: number) {
    // Delete the OTP token
    await Token.destroy({
      where: {
        user_id: userId,
        otp_type: OTPType.TYPE.forgotPassword,
      },
    });
    const customer = await User.findOne({ where: { id: userId } });
    const jwtToken = await JwtUtils.createToken({
      id: customer.id,
      email: customer.email,
      type: customer.role,
    });

    await RedisHelper.sAdd(`${customer.role}:${customer.id}.token`, jwtToken);

    return {
      message: SuccessMsg.AUTH.verifyOTP,
      token: jwtToken,
    };
  }

  async resetPassword(args: ResetPasswordData, userId: number) {
    const { password } = args;

    // Find user by email
    const user: IUser = await User.findOne({
      where: { id: userId },
    });

    if (!user) {
      Utils.throwError(ErrorMsg.USER.emailNotFound);
    }

    const hashedPassword = await HashUtils.generateHash(password);

    // Update user password
    await User.update({ password: hashedPassword }, { where: { id: user.id } });

    // Delete the reset token after successful password reset

    return {
      message: SuccessMsg.AUTH.passwordReset,
    };
  }

  async resendOtp(args: Record<string, string>) {
    const { email, otp_type } = args;

    // Find the user
    const user: IUser | null = await User.findOne({ where: { email } });
    if (!user) {
      Utils.throwError(ErrorMsg.USER.notFound);
    }

    // Find the existing token
    const token = await Token.findOne({ where: { email, otp_type }, raw: true });

    if (!token && otp_type === 'register' && user.is_verified) {
      // No token exists → cannot resend OTP
      Utils.throwError(ErrorMsg.USER.alreadyExists); // or create a custom message: "No OTP found to resend"
    }
    if (!token) {
      // No token exists → cannot resend OTP
      Utils.throwError(ErrorMsg.USER.notFound); // or create a custom message: "No OTP found to resend"
    }

    // Destroy the old token

    // Generate and send new OTP
    const OTP = generateOTP();
    console.log('OTP: ', OTP);
    await Token.update(
      { otp: OTP }, // values to update
      { where: { id: token.id } }, // condition
    );

    await sendAccountVerifyOtp(user, OTP);

    return {
      message: SuccessMsg.USER.sendOtp,
      otp: OTP,
    };
  }

  async changeEmail(args: ChangeEmailData) {
    const user: IUser = await User.findOne({
      where: { email: args.email },
    });

    if (!user) Utils.throwError(ErrorMsg.USER.emailNotFound);

    const OTP = generateOTP();

    const existingToken = await Token.findOne({
      where: {
        user_id: user.id,
        otp_type: OTPType.TYPE.changeEmail,
      },
    });

    if (existingToken) {
      await existingToken.update({ otp: OTP });
    } else {
      await Token.create({
        user_id: user.id,
        otp_type: OTPType.TYPE.changeEmail,
        user_type: user.role,
        otp: OTP,
      });
    }

    return { message: SuccessMsg.USER.sendOtp, otp: OTP };
  }

  async changeEmailVerifyOTP(args: ChangeEmailVerifyOTPData) {
    const user: IUser = await User.findOne({
      where: { email: args.current_email },
    });

    if (!user) Utils.throwError(ErrorMsg.USER.incorrectOTP);

    const token = await Token.findOne({
      where: {
        user_id: user.id,
        otp_type: OTPType.TYPE.changeEmail,
        user_type: user.role,
      },
    });

    if (!token) Utils.throwError(ErrorMsg.USER.incorrectOTP);

    const isMatch = await HashUtils.compareHash(args.otp, token.otp);
    if (!isMatch) Utils.throwError(ErrorMsg.USER.incorrectOTP);

    const [updatedCount, updatedUsers] = await User.update(
      { email: args.new_email },
      {
        where: { id: user.id },
        returning: true,
      },
    );

    if (!updatedCount || !updatedUsers.length) {
      Utils.throwError(ErrorMsg.USER.changeEmailError);
    }

    await Token.destroy({
      where: {
        user_id: user.id,
        otp_type: OTPType.TYPE.changeEmail,
        user_type: user.role,
      },
    });

    return { message: SuccessMsg.AUTH.changeEmail };
  }
})();
