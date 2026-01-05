import { Request } from 'express';
import { IUser } from '../models/user.model';

export interface ISearch {
  page?: number;
  limit?: number;
  search?: string;
  filter?: string;
  interested?: boolean;
  submitted?: boolean;
  pending?: boolean;
  accepted?: boolean;
  completed?: boolean;
  won?: boolean;
  status?: string;
}

export interface IRequest extends Request {
  file: any;
  user: IUser & { type?: string };
  token: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  service_category?: number[] | [];
  role: string;
}

export interface LoginData {
  email: string;
  password: string;
  fcm_token: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  profile_image?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
  otp_type: string;
}

export interface ChangePasswordData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  password: string;
}

export interface ChangeEmailData {
  email: string;
}

export interface ChangeEmailVerifyOTPData {
  current_email: string;
  new_email: string;
  otp: string;
}

export interface LogoutData {
  fcm_token?: string;
  token?: string;
  user_type?: string;
}

export interface CreateJobData {
  title: string;
  description: string;
  category_id: number;
  project_size: string;
  budget_min?: number;
  budget_max?: number;
  budget_type: string;
  work_finish_type: string;
  work_finish_from?: string;
  work_finish_to?: string;
  location: string;
  images?: string[];
}

export interface SubmitBidData {
  job_id?: number;
  amount?: number;
  message?: string;
  currency?: string;
}

export interface AcceptBidData {
  bid_id: number;
  status: string;
}

export interface SwipeData {
  job_id: number;
  professional_id: number;
}

export interface LikeProfessionalData {
  job_id: number;
  professional_id: number;
}

export interface RatingData {
  professional_id?: number;
  job_id: number;
  role?: string;
  rating: number;
}
export interface ICreateChat {
  job_id: number;
  receiver_id: number;
}
export interface ISendMessage {
  chat_id: string;
  message: string;
}
export interface IChangeJobStatus {
  action: string;
}

export interface IQuoteReceivedEmailArgs {
  professionalName: string;
  professionalEmail: string;
  jobTitle: string;
  jobId: number | string;
  quoteAmount: number;
  currency: string;
  email?: string;
}

export interface IQuoteActionEmailArgs {
  jobTitle: string;
  professionalName: string;
  jobId: number | string;
  quoteAmount: number;
  currency: string;
  email?: string;
  jobLocation?: string;
}

export interface IJobCompletedEmailArgs {
  professionalName: string;
  professionalEmail?: string;
  customerName: string;
  jobTitle: string;
  jobId: number | string;
  email?: string;
  jobLocation?: string;
  currency?: string;
  quoteAmount?: string;
}
