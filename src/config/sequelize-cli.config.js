// Standalone config file for sequelize-cli
// This file is loaded directly by sequelize-cli without TypeScript compilation

require('dotenv').config();

const dbConfig = {
  DATABASE_HOST: process.env.DATABASE_HOST,
  DATABASE_USERNAME: process.env.DATABASE_USERNAME,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  DATABASE_NAME: process.env.DATABASE_NAME,
};

const config = {
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

module.exports = config;

