import { createClient } from 'redis';
import RedisConfig from '../config/redis.config';

import logger from './logger';

export async function connectToRedis(): Promise<void> {
  try {
    const pubClient = createClient({ url: RedisConfig.url });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);
    logger.info('Redis server connected');
  } catch (error) {
    // Handle connection errors here
    logger.error('Error connecting to Redis server:', error);
  }
}
