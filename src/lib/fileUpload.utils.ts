import { v4 as uuidv4 } from 'uuid';
import { Response, NextFunction } from 'express';
import { removeFileFromS3, uploadFileToS3 } from './aws.utils';
import * as Utils from '../lib/utils';
import { IRequest } from './common.interface';
import { PutObjectCommandInput } from '@aws-sdk/client-s3';

import awsConfig from '../config/aws.config';

export interface MulterFile {
  fieldname: string;
  originalname: string;
  buffer: Buffer;
  size: number;
  stream?: ReadableStream;
  destination?: string;
  filename?: string;
  path?: string;
}

export const multiplePartImagesUpload = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const files = req.files as unknown as { [fieldname: string]: MulterFile[] };

    const documents: string[] = [];

    // Upload images
    if (files.documents?.length) {
      for (const file of files.documents) {
        const { extension } = Utils.extractFilePath(file.originalname);
        const filepath = `documents/${uuidv4()}.${extension}`;
        const uploadParams: PutObjectCommandInput = {
          Body: file.buffer,
          Key: filepath,
          Bucket: awsConfig.s3BucketName,
        };
        await uploadFileToS3(uploadParams);
        documents.push(`/${filepath}`);
      }
    }

    // Upload EN documents

    req.body = {
      ...req.body,
      documents: documents,
    };

    next();
  } catch (err) {
    res.status(Utils.getErrorStatusCode(err)).send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
  }
};

export const singleProfileImageUpload = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = req.file as Express.Multer.File;
    if (!file) {
      return next();
    }
    const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
      const { extension } = Utils.extractFilePath(file.originalname);
      const filepath = `profile_image/${uuidv4()}.${extension}`;
      const uploadedFileUrl = `/${filepath}`;

      const uploadParams: PutObjectCommandInput = {
        Body: file.buffer,
        Key: filepath,
        Bucket: awsConfig.s3BucketName,
      };

      await uploadFileToS3(uploadParams);
      return uploadedFileUrl;
    };

    const mediaUrl = await uploadToS3(file);

    req.body = {
      ...req.body,
      profile_image: mediaUrl,
    };

    next();
  } catch (err) {
    res.status(Utils.getErrorStatusCode(err)).send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
  }
};

export const jobImagesUpload = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const files = req.files as unknown as { images?: MulterFile[] };
    const images: string[] = [];

    if (files.images && Array.isArray(files.images) && files.images.length > 0) {
      for (const file of files.images) {
        const { extension } = Utils.extractFilePath(file.originalname);
        const filepath = `job_images/${uuidv4()}.${extension}`;
        const uploadedFileUrl = `/${filepath}`;

        const uploadParams: PutObjectCommandInput = {
          Body: file.buffer,
          Key: filepath,
          Bucket: awsConfig.s3BucketName,
        };

        await uploadFileToS3(uploadParams);
        images.push(uploadedFileUrl);
      }
    }

    req.body = {
      ...req.body,
      images: images,
    };

    next();
  } catch (err) {
    res.status(Utils.getErrorStatusCode(err)).send(Utils.sendErrorResponse(Utils.getErrorMsg(err)));
  }
};
