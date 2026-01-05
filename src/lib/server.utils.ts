import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
// import swaggerJSDoc from 'swagger-jsdoc';
// import swaggerUi from 'swagger-ui-express';
// import SwaggerConfig from '../config/swagger.config';
import routes from '../routes';

// Import Utility
import logger, { morganMiddleware } from './logger';

export function createServer() {
  return new Promise<Express>((resolve, reject) => {
    try {
      const app: Express = express();

      // enable CORS - Cross Origin Resource Sharing
      app.use(cors({ credentials: true, origin: '*' }));
      app.use(morganMiddleware);

      app.use(bodyParser.urlencoded({ extended: false }));
      app.use(bodyParser.json());

      // Routes
      app.use('/api/v1', routes);

      // Home Route
      app.get('/', (req: Request, res: Response) => {
        return res.send({ message: 'ByGo-Backend Running Successfully' });
      });

      // const swaggerSpec = swaggerJSDoc(SwaggerConfig.options);
      // app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

      resolve(app);
    } catch (err) {
      logger.error(err);
      reject(err);
    }
  });
}
