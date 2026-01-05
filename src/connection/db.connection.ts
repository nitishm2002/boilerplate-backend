import { Sequelize } from 'sequelize';
import logger from '../lib/logger';
import config from '../config/db.config';


interface DbConfig {
  DATABASE_NAME: string;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
  DATABASE_HOST: string;
}

const dbConfig: DbConfig = config;

export const sequelize = new Sequelize(
  dbConfig.DATABASE_NAME,
  dbConfig.DATABASE_USERNAME,
  dbConfig.DATABASE_PASSWORD,
  {
    host: dbConfig.DATABASE_HOST,
    port: 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },
    logging: false,
  },
);

export const connect = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info(
      `Database connection established with PostgreSQL database: "${dbConfig.DATABASE_NAME}".`,
    );
  } catch (error) {
    logger.error(`Error connecting to the database: ${error}`);
    process.exit(1);
  }
};
