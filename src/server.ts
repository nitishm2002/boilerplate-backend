import logger from './lib/logger';
import config from './config/config';
import * as ServerUtils from './lib/server.utils';
// import * as RedisUtils from './lib/redis.utils';
import * as DATABASE from './connection/db.connection';
// Import models to initialize associations
import './models/index';
// import { initSocket } from './lib/socket.utils';

void (async () => {
  // Connect Redis
  // await RedisUtils.connectToRedis();

  // Connect Database
  await DATABASE.connect();

  // Connect Server
  ServerUtils.createServer()
    .then((app) => {
      // Start the server
      const PORT = config.PORT;
      const server = app.listen(PORT, () => {
        logger.info(`Server is running at: http://localhost:${PORT}`);
      });

      // // Initialize Socket.IO
      // initSocket(server);
    })
    .catch((err) => {
      logger.error(err);
    });
})();
