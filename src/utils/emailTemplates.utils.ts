// import { IEarlyAccess } from 'src/models/earlyAccess.model';
// import { IUser } from '../models/user.model';
// import {
//   IJobCompletedEmailArgs,
//   IQuoteActionEmailArgs,
//   IQuoteReceivedEmailArgs,
// } from '../lib/common.interface';

// const bygoLogo = 'https://minio.techreale.com/bygo/bygo-logo-yellow.png';

// // Base email template styles
// const baseStyles = `
//   body {
//     font-family: Arial, sans-serif;
//     margin: 0;
//     padding: 0;
//     background-color: #111111;
//   }

//   .email-container {
//     max-width: 600px;
//     margin: 20px auto;
//     background-color: #000000;
//     padding: 24px 20px 28px;
//     border-radius: 16px;
//     border: 1px solid #333333;
//   }

//   .header-image {
//     text-align: center;
//     margin-bottom: 20px;
//   }

//   .header-image img {
//     max-width: 140px;
//     height: auto;
//     display: block;
//     margin: 0 auto;
//   }

//   h2 {
//     color: #FFD200;
//     font-size: 22px;
//     margin-top: 0;
//     margin-bottom: 10px;
//     text-align: left;
//   }

//   h3 {
//     color: #FFD200;
//     font-size: 18px;
//     margin-bottom: 8px;
//   }

//   p {
//     color: #f5f5f5;
//     font-size: 15px;
//     line-height: 1.6;
//     margin: 8px 0;
//   }

//   .credentials,
//   .machine-details,
//   .info-block {
//     background-color: #181818;
//     padding: 14px 12px;
//     border-radius: 10px;
//     margin: 16px 0;
//     font-size: 15px;
//     border: 1px solid #333333;
//   }

//   .credentials p {
//     margin: 4px 0;
//     font-weight: 600;
//   }

//   .btn-container {
//     text-align: center;
//     margin: 24px 0 18px;
//   }

//   .btn {
//     background-color: #FFD200;
//     color: #000000 !important;
//     padding: 11px 28px;
//     border-radius: 999px;
//     text-decoration: none;
//     font-weight: 600;
//     font-size: 15px;
//     display: inline-block;
//   }

//   .btn:hover {
//     background-color: #e6bf00;
//   }

//   a {
//     color: #FFD200;
//     text-decoration: none;
//   }

//   a:hover {
//     text-decoration: underline;
//   }

//   .footer {
//     text-align: center;
//     font-size: 11px;
//     color: #999999;
//     margin-top: 26px;
//   }

//   .otp {
//     background-color: #181818;
//     padding: 12px 10px;
//     border-radius: 10px;
//     margin: 18px 0;
//     text-align: center;
//     font-size: 26px;
//     color: #FFD200;
//     font-weight: 700;
//     letter-spacing: 4px;
//     border: 1px solid #333333;
//   }

//   @media (max-width: 600px) {
//     .email-container {
//       margin: 0;
//       border-radius: 0;
//       padding: 18px 14px 22px;
//     }
//     h2 {
//       font-size: 19px;
//     }
//     p {
//       font-size: 14px;
//     }
//     .btn {
//       width: 100%;
//       text-align: center;
//     }
//     .header-image img {
//       max-width: 120px;
//     }
//   }
// `;

// // Reusable email components
// const createEmailHeader = () => `
//   <div class="header-image">
//     <img src="${bygoLogo}" alt="ByGo Logo">
//   </div>
// `;

// const createEmailFooter = () => `
//   <div class="footer">
//     <p>&copy; ${new Date().getFullYear()} ByGo. All rights reserved.</p>
//   </div>
// `;

// const createBaseEmailTemplate = (content: string) => `
//   <!DOCTYPE html>
//   <html>
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <style>${baseStyles}</style>
//   </head>
//   <body>
//     <div class="email-container">
//       ${content}
//     </div>
//   </body>
//   </html>
// `;

// // New User Credentials Email Template
// export function getRegistrationOTPTemplate(user: IUser, otpCode: string): string {
//   const content = `
//     ${createEmailHeader()}

//     <h2>Welcome to ByGo &mdash; Verify Your Email</h2>
//     <p>Hi ${user.name},</p>
//     <p>Thank you for registering with ByGo! To complete your registration, please verify your email address using the one-time password (OTP) below:</p>

//     <h3>Your OTP:</h3>
//     <div class="otp">${otpCode}</div>

//     <p>Please enter this OTP in the app to verify your account. The OTP is valid for 10 minutes and can only be used once.</p>

//     <p>If you did not create an account or received this email by mistake, please ignore it or contact our support team at support@bygo.com.</p>

//     <p>We’re excited to have you onboard!</p>
//     <p>Best regards,</p>
//     <p>The ByGo Team</p>
//    <p><a href="mailto:info@bygo.com">info@bygo.com</a></p>
//     <p><a href="https://www.bygo.ai">www.bygo.ai</a></p>

//     ${createEmailFooter()}
//   `;

//   return createBaseEmailTemplate(content);
// }

// export function getPasswordResetOTPTemplate(user: IUser, otpCode: string): string {
//   const content = `
//     ${createEmailHeader()}

//     <p>Hello ${user.name},</p>
//     <p>We have received a request to reset your password for your Bygo Portal account. Please use the one-time password (OTP) below to verify your request.</p>

//     <div class="otp">${otpCode}</div>

//     <p>This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email or contact our support team immediately.</p>
//     <p>For security reasons, do not share this OTP with anyone.</p>

//     <p>Best regards,</p>
//     <p>ByGo</p>
//     <p><a href="mailto:info@bygo.com">info@bygo.com</a></p>
//     <p><a href="https://www.bygo.ai">www.bygo.ai</a></p>

//     ${createEmailFooter()}
//   `;

//   return createBaseEmailTemplate(content);
// }

// export function getEarlyAccessConfirmationTemplate(user: IEarlyAccess): string {
//   const content = `
//     ${createEmailHeader()}

//     <p>Hello User,</p>

//     <p>Thank you for opting in for early access to the ByGo platform.</p>

//     <p>
//       We have successfully received your request. You’ll be among the first to
//       hear from us as we roll out early access and share important updates.
//     </p>

//     <p>
//       Our team is actively working to deliver a reliable and valuable experience,
//       and we look forward to connecting with you soon.
//     </p>

//     <p>Regards,</p>
//     <p><strong>ByGo</strong></p>
//  <p><a href="mailto:info@bygo.com">info@bygo.com</a></p>
//     <p><a href="https://www.bygo.ai">www.bygo.ai</a></p>

//     ${createEmailFooter()}
//   `;

//   return createBaseEmailTemplate(content);
// }

// export function getQuoteReceivedEmailTemplate(args: IQuoteReceivedEmailArgs): string {
//   const { professionalName, professionalEmail, jobTitle, jobId, quoteAmount, currency } = args;

//   const content = `
//     ${createEmailHeader()}

//     <h2>New Quote Received</h2>
//     <p>Hello,</p>
//     <p>You have received a new quote for your job <strong>"${jobTitle}"</strong> (Job ID: <strong>${jobId}</strong>).</p>

//     <div class="info-block">
//       <p><strong>Professional Name:</strong> ${professionalName}</p>
//       <p><strong>Professional Email:</strong> ${professionalEmail}</p>
//       <p><strong>Quote Amount:</strong> ${currency} ${quoteAmount}</p>
//     </div>
//     <p>Best regards,</p>
//     <p>The ByGo Team</p>
//    <p><a href="mailto:info@bygo.com">info@bygo.com</a></p>
//     <p><a href="https://www.bygo.ai">www.bygo.ai</a></p>

//     ${createEmailFooter()}
//   `;

//   return createBaseEmailTemplate(content);
// }

// // 1️⃣ Quote Accepted by Customer
// export function getQuoteAcceptedEmailTemplate(args: IQuoteActionEmailArgs): string {
//   const { professionalName, jobTitle, jobId, quoteAmount, currency, jobLocation } = args;

//   const content = `
//     ${createEmailHeader()}

//     <h2>Quote Accepted</h2>

//     <p>Hello ${professionalName},</p>

//     <p>
//        Your quote for the job <strong>"${jobTitle}"</strong> (Job ID: <strong>${jobId}</strong>)
//       has been accepted by the customer.
//     </p>

//     <div class="info-block">
//       <p><strong>Job Title:</strong> ${jobTitle}</p>
//       <p><strong>Job ID:</strong> ${jobId}</p>
//       <p><strong>Location:</strong> ${jobLocation}</p>
//       <p><strong>Accepted Quote:</strong> ${currency} ${quoteAmount}</p>
//     </div>

//     <p>
//       You can now proceed to start the job. Please check your dashboard for full job details and next steps.
//     </p>

//     <p>Best regards,</p>
//     <p>The ByGo Team</p>
//     <p><a href="mailto:info@bygo.com">info@bygo.com</a></p>
//     <p><a href="https://www.bygo.ai">www.bygo.ai</a></p>

//     ${createEmailFooter()}
//   `;

//   return createBaseEmailTemplate(content);
// }

// export function getQuoteRejectedEmailTemplate(args: IQuoteActionEmailArgs): string {
//   const { professionalName, jobTitle, jobId, quoteAmount, currency, jobLocation } = args;

//   const content = `
//     ${createEmailHeader()}

//     <h2>Quote Rejected</h2>

//     <p>Hello ${professionalName},</p>

//     <p>
//       Thank you for submitting your quote. Unfortunately, your quote for the job
//       <strong>"${jobTitle}"</strong> (Job ID: <strong>${jobId}</strong>)
//       was not accepted by the customer.
//     </p>

//     <div class="info-block">
//       <p><strong>Job Title:</strong> ${jobTitle}</p>
//       <p><strong>Job ID:</strong> ${jobId}</p>
//       <p><strong>Location:</strong> ${jobLocation}</p>
//       <p><strong>Submitted Quote:</strong> ${currency} ${quoteAmount}</p>
//     </div>

//     <p>Best regards,</p>
//     <p>The ByGo Team</p>
//     <p><a href="mailto:info@bygo.com">info@bygo.com</a></p>
//     <p><a href="https://www.bygo.ai">www.bygo.ai</a></p>

//     ${createEmailFooter()}
//   `;

//   return createBaseEmailTemplate(content);
// }

// // 3️⃣ Job Completed by Professional

// export function getJobCompletedEmailTemplate(args: IJobCompletedEmailArgs): string {
//   const {
//     professionalName,
//     professionalEmail,
//     customerName,
//     jobTitle,
//     jobId,
//     jobLocation,
//     currency,
//     quoteAmount,
//   } = args;

//   const content = `
//     ${createEmailHeader()}

//     <h2>Job Completed</h2>
//     <p>Hello ${customerName},</p>
//     <p>The job <strong>"${jobTitle}"</strong> (Job ID: <strong>${jobId}</strong>) has been marked as completed by ${professionalName}.</p>

//     <div class="info-block">
//       <p><strong>Professional Name:</strong> ${professionalName}</p>
//       <p><strong>Professional Email:</strong> ${professionalEmail}</p>
//       <p><strong>Job Title:</strong> ${jobTitle}</p>
//       <p><strong>Job ID:</strong> ${jobId}</p>
//       <p><strong>Location:</strong> ${jobLocation}</p>
//       <p><strong>Submitted Quote:</strong> ${currency} ${quoteAmount}</p>
//     </div>

//     <p>Please review the job details.</p>

//     <p>Best regards,</p>
//     <p>The ByGo Team</p>
//     <p><a href="mailto:info@bygo.com">info@bygo.com</a></p>
//     <p><a href="https://www.bygo.ai">www.bygo.ai</a></p>
//     ${createEmailFooter()}
//   `;

//   return createBaseEmailTemplate(content);
// }
