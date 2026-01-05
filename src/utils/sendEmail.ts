import { IUser } from '../models/user.model';

import {
  getRegistrationOTPTemplate,
  getPasswordResetOTPTemplate,
  getEarlyAccessConfirmationTemplate,
  getQuoteAcceptedEmailTemplate,
  getQuoteRejectedEmailTemplate,
  getJobCompletedEmailTemplate,
  getQuoteReceivedEmailTemplate,
} from './emailTemplates';
import { sendEmailWithTransport } from './emailSender';
import { IEarlyAccess } from '../models/earlyAccess.model';
import {
  IJobCompletedEmailArgs,
  IQuoteActionEmailArgs,
  IQuoteReceivedEmailArgs,
} from '../lib/common.interface';

export async function sendAccountVerifyOtp(user: IUser, otp: string): Promise<boolean> {
  const html = getRegistrationOTPTemplate(user, otp);
  return sendEmailWithTransport({
    to: user.email,
    subject: 'Account Verification - OTP Verification',
    html,
  });
}

export async function sendPasswordResetOTP(user: IUser, otpCode: string): Promise<boolean> {
  const html = getPasswordResetOTPTemplate(user, otpCode);
  return sendEmailWithTransport({
    to: user.email,
    subject: 'Password Reset Request – OTP Verification',
    html,
  });
}

export async function sendEarlyAccessConfirmationTemplate(user: IEarlyAccess): Promise<boolean> {
  const html = getEarlyAccessConfirmationTemplate(user);
  return sendEmailWithTransport({
    to: user.email,
    subject: 'Early Access – Confirmation',
    html,
  });
}

export async function sendQuoteReceivedEmail(args: IQuoteReceivedEmailArgs): Promise<boolean> {
  const { professionalName, professionalEmail, jobTitle, jobId, quoteAmount, currency, email } =
    args;
  const html = getQuoteReceivedEmailTemplate({
    professionalName: professionalName || '',
    professionalEmail: professionalEmail || '',
    jobTitle,
    jobId,
    quoteAmount: quoteAmount || 0,
    currency: currency || 'USD',
  });
  return sendEmailWithTransport({
    to: email,
    subject: `New Quote Received for "${jobTitle}"`,
    html,
  });
}

// 2️⃣ Quote Accepted (to Professional)
export async function sendQuoteAcceptedEmail(args: IQuoteActionEmailArgs): Promise<boolean> {
  const { professionalName, jobTitle, jobId, quoteAmount, currency, email, jobLocation } = args;
  const html = getQuoteAcceptedEmailTemplate({
    professionalName,
    jobTitle,
    jobId,
    quoteAmount: quoteAmount || 0,
    currency: currency || 'USD',
    jobLocation,
  });
  return sendEmailWithTransport({
    to: email,
    subject: `Quote Accepted for "${jobTitle}"`,
    html,
  });
}

// 3️⃣ Quote Rejected (to Professional)
export async function sendQuoteRejectedEmail(args: IQuoteActionEmailArgs): Promise<boolean> {
  const { professionalName, jobTitle, jobId, quoteAmount, currency, email } = args;
  const html = getQuoteRejectedEmailTemplate({
    professionalName,
    jobTitle,
    jobId,
    quoteAmount: quoteAmount || 0,
    currency: currency || 'USD',
  });
  return sendEmailWithTransport({
    to: email,
    subject: `Quote Rejected for "${jobTitle}"`,
    html,
  });
}

// 4️⃣ Job Completed (to Customer)
export async function sendJobCompletedEmail(args: IJobCompletedEmailArgs): Promise<boolean> {
  const {
    professionalName = '',
    customerName = '',
    jobTitle,
    jobId,
    email,
    jobLocation,
    currency,
    quoteAmount,
  } = args;
  const html = getJobCompletedEmailTemplate({
    professionalName,
    jobTitle,
    jobId,
    customerName,
    jobLocation,
    currency,
    quoteAmount,
  });
  return sendEmailWithTransport({
    to: email,
    subject: `Job Completed: "${jobTitle}"`,
    html,
  });
}
