import Joi, { ValidationResult } from 'joi';
import dotenv from 'dotenv';

interface IEnvVars {
  PORT: string;
  NODE_ENV: string;
  DEBUG: string;
  JWT_SECRET: string;
  DATABASE_HOST: string;
  DATABASE_NAME: string;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
  // REDIS_URL: string;
  // USER_EMAIL: string;
  // EMAIL_PASS: string;
  // EMAIL_HOST: string;
  // EMAIL_SERVICE: string;

  AWS_ACCESS_KEY: string;
  AWS_SECRET_ACCESS: string;
  AWS_REGION: string;
  S3_BUCKET_NAME: string;
  S3_ENDPOINT: string;

  // TWILIO_ACCOUNT_SID: string;
  // TWILIO_AUTH_TOKEN: string;
  // TWILIO_PHONE_NUMBER: string;
  // MESSAGING_SERVICE_SID: string;
}
dotenv.config();
// Define schema for environment variables with clear types
const schema: Joi.ObjectSchema<IEnvVars> = Joi.object<IEnvVars, true, IEnvVars>({
  PORT: Joi.string().required().description('Port is required'),
  NODE_ENV: Joi.string().required().description('NODE_ENV is required'),
  DEBUG: Joi.string().required().description('DEBUG is required'),
  DATABASE_HOST: Joi.string().required().description('DATABASE_HOST is required'),
  JWT_SECRET: Joi.string().required().description('JWT_SECRET is required'),
  DATABASE_NAME: Joi.string().required().description('DATABASE_NAME is required'),
  DATABASE_USERNAME: Joi.string().required().description('DATABASE_USERNAME is required'),
  DATABASE_PASSWORD: Joi.string().required().description('DATABASE_PASSWORD is required'),
  // REDIS_URL: Joi.string().required().description('REDIS_URL is required'),

  // USER_EMAIL: Joi.string().required().description('USER_EMAIL is required'),
  // EMAIL_PASS: Joi.string().required().description('EMAIL_PASS is required'),
  // EMAIL_HOST: Joi.string().required().description('EMAIL_HOST is required'),
  // EMAIL_SERVICE: Joi.string().required().description('EMAIL_SERVICE is required'),

  AWS_ACCESS_KEY: Joi.string().required().description('AWS ACCESS KEY is required'),
  AWS_SECRET_ACCESS: Joi.string().required().description('AWS SECRET_ACCESS is required'),
  AWS_REGION: Joi.string().required().description('AWS REGION is required'),
  S3_BUCKET_NAME: Joi.string().required().description('S3 BUCKET NAME is required'),
  S3_ENDPOINT: Joi.string().optional(),

  // TWILIO_ACCOUNT_SID: Joi.string().required().description('TWILIO ACCOUNT SID is required'),
  // TWILIO_AUTH_TOKEN: Joi.string().required().description('TWILIO AUTH TOKEN is required'),
  // TWILIO_PHONE_NUMBER: Joi.string().required().description('TWILIO PHONE NUMBER is required'),
  // MESSAGING_SERVICE_SID: Joi.string().required().description('MESSAGING SERVICE SID is required'),
})
  .unknown()
  .required();

// Validate environment variables with type safety
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { error, value }: ValidationResult<IEnvVars> = schema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: IEnvVars = value as IEnvVars;

// Construct configuration object with type annotations
const config: IEnvVars = {
  PORT: envVars.PORT,
  NODE_ENV: envVars.NODE_ENV,
  DEBUG: envVars.DEBUG,
  JWT_SECRET: envVars.JWT_SECRET,
  DATABASE_HOST: envVars.DATABASE_HOST,
  DATABASE_NAME: envVars.DATABASE_NAME,
  DATABASE_USERNAME: envVars.DATABASE_USERNAME,
  DATABASE_PASSWORD: envVars.DATABASE_PASSWORD,
  // REDIS_URL: envVars.REDIS_URL,

  // USER_EMAIL: envVars.USER_EMAIL,
  // EMAIL_PASS: envVars.EMAIL_PASS,
  // EMAIL_HOST: envVars.EMAIL_HOST,
  // EMAIL_SERVICE: envVars.EMAIL_SERVICE,

  AWS_ACCESS_KEY: envVars.AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS: envVars.AWS_SECRET_ACCESS,
  AWS_REGION: envVars.AWS_REGION,
  S3_BUCKET_NAME: envVars.S3_BUCKET_NAME,
  S3_ENDPOINT: envVars.S3_ENDPOINT,

  // TWILIO_ACCOUNT_SID: envVars.TWILIO_ACCOUNT_SID,
  // TWILIO_AUTH_TOKEN: envVars.TWILIO_AUTH_TOKEN,
  // TWILIO_PHONE_NUMBER: envVars.TWILIO_PHONE_NUMBER,
  // MESSAGING_SERVICE_SID: envVars.MESSAGING_SERVICE_SID,
};

export default config;
