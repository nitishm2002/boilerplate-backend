import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  PutObjectCommandInput,
  DeleteObjectCommandInput,
  PutObjectCommandOutput,
  DeleteObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import awsConfig from '../config/aws.config';

const getS3Client = () => {
  return new S3Client({
    region: awsConfig.s3Region,
    credentials: {
      accessKeyId: awsConfig.accessKeyId,
      secretAccessKey: awsConfig.secretAccessKey,
    },
    endpoint: awsConfig.s3Endpoint,
    forcePathStyle: true, // REQUIRED FOR MINIO
  });
};

// -------------------
// Upload File to S3
// -------------------
export const uploadFileToS3 = async (
  options: PutObjectCommandInput,
): Promise<PutObjectCommandOutput> => {
  const client = getS3Client();

  // Supports any size file (multipart for big files)
  const upload = new Upload({
    client,
    params: options,
  });

  return upload.done();
};

// -------------------
// Remove File From S3
// -------------------
export const removeFileFromS3 = async (
  options: DeleteObjectCommandInput,
): Promise<DeleteObjectCommandOutput> => {
  const client = getS3Client();
  const command = new DeleteObjectCommand(options);
  return client.send(command);
};
