// import logger from '../lib/logger';
// import nodemailer from 'nodemailer';
// import config from '../config/email.config';

// // Email configuration interface
// interface EmailConfig {
//   to: string | string[];
//   subject: string;
//   html: string;
//   from?: string;
// }

// interface TransportConfig {
//   host?: string;
//   port?: number;
//   secure?: boolean;
//   user?: string;
//   pass?: string;
//   rejectUnauthorized?: boolean;
// }

// // Retry configuration
// const RETRY_ATTEMPTS = 3;
// const RETRY_DELAY = 1000; // 1 second

// // Core email sending function with configurable transport options and retry logic
// export async function sendEmailWithTransport(
//   emailConfig: EmailConfig,
//   transportConfig?: TransportConfig,
// ): Promise<boolean> {
//   let lastError: Error | null = null;

//   for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
//     try {
//       // Use provided config or fall back to defaults
//       const host = transportConfig?.host || config.EMAIL_HOST;
//       const port = transportConfig?.port || 587;
//       const secure = transportConfig?.secure !== undefined ? transportConfig.secure : false;
//       const user = transportConfig?.user || config.USER_EMAIL;
//       const pass = transportConfig?.pass || config.EMAIL_PASS;
//       const rejectUnauthorized =
//         transportConfig?.rejectUnauthorized !== undefined
//           ? transportConfig.rejectUnauthorized
//           : false;

//       const transporter = nodemailer.createTransport({
//         host,
//         port,
//         secure,
//         auth: {
//           user,
//           pass,
//         },
//         tls: {
//           rejectUnauthorized,
//         },
//         // Connection pool settings for better performance
//         pool: true,
//         maxConnections: 5,
//         maxMessages: 100,
//         rateLimit: 14, // Max 14 emails per second
//       });

//       const mailOptions = {
//         from: emailConfig.from || user,
//         to: emailConfig.to,
//         subject: emailConfig.subject,
//         html: emailConfig.html,
//       };

//       const result = await new Promise<boolean>((resolve, reject) => {
//         transporter.sendMail(mailOptions, (error, info) => {
//           if (error) {
//             logger.error(`Email sending failed (attempt ${attempt}): ${error}`);
//             reject(error);
//           } else if (info && typeof info.response === 'string') {
//             logger.debug(`Email sent successfully (attempt ${attempt}): ${info.response}`);
//             resolve(true);
//           } else {
//             logger.debug(`Email sent successfully (attempt ${attempt}, no response available)`);
//             resolve(true);
//           }
//         });
//       });

//       // Close the transporter to free up connections
//       transporter.close();
//       return result;
//     } catch (error) {
//       lastError = error as Error;

//       if (attempt < RETRY_ATTEMPTS) {
//         logger.warn(`Email sending attempt ${attempt} failed, retrying in ${RETRY_DELAY}ms...`);
//         await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
//       }
//     }
//   }

//   // All retry attempts failed
//   logger.error(`Email sending failed after ${RETRY_ATTEMPTS} attempts. Last error: ${lastError}`);
//   throw lastError;
// }

// // Default email sender using main config
// export async function sendEmail(email: string, subject: string, text: string): Promise<boolean> {
//   return sendEmailWithTransport({
//     to: email,
//     subject,
//     html: text,
//   });
// }
