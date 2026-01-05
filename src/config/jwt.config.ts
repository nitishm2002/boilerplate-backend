import { SignOptions } from 'jsonwebtoken';
import config from './config';

export default {
  secret: config.JWT_SECRET,
  signOptions: {
    expiresIn: '8h',
    algorithm: 'HS256',
  } as SignOptions,
};
