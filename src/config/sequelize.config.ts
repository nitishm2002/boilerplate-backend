import dbConfig from './db.config';

interface SequelizeConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: string;
  dialectOptions?: {
    ssl?: {
      rejectUnauthorized: boolean;
    };
  };
  logging: boolean | ((sql: string) => void);
}

const config: { [key: string]: SequelizeConfig } = {
  development: {
    username: dbConfig.DATABASE_USERNAME,
    password: dbConfig.DATABASE_PASSWORD,
    database: dbConfig.DATABASE_NAME,
    host: dbConfig.DATABASE_HOST,
    port: 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
    logging: false,
  },
  production: {
    username: dbConfig.DATABASE_USERNAME,
    password: dbConfig.DATABASE_PASSWORD,
    database: dbConfig.DATABASE_NAME,
    host: dbConfig.DATABASE_HOST,
    port: 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
    logging: false,
  },
  test: {
    username: dbConfig.DATABASE_USERNAME,
    password: dbConfig.DATABASE_PASSWORD,
    database: dbConfig.DATABASE_NAME,
    host: dbConfig.DATABASE_HOST,
    port: 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
    logging: false,
  },
};

// Export as module.exports for sequelize-cli compatibility
// Sequelize CLI expects the config to be exported with environment keys
// Also export the current environment config as default for direct require
const env = process.env.NODE_ENV || 'development';
module.exports = config;
module.exports.default = config[env];
export default config;

