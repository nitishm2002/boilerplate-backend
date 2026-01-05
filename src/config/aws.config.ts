import config from './config';

export default {
  accessKeyId: config.AWS_ACCESS_KEY,
  secretAccessKey: config.AWS_SECRET_ACCESS,
  s3Region: config.AWS_REGION,
  s3BucketName: config.S3_BUCKET_NAME,
  s3Endpoint: config.S3_ENDPOINT,
};
