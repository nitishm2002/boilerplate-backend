// This file is loaded by sequelize-cli
// Sequelize CLI expects an object with environment keys (development, production, test)

// Load environment variables first
require('dotenv').config();

// Register TypeScript support
require('ts-node/register');

// Import the TypeScript config
const tsConfigModule = require('./sequelize.config.ts');

// Handle both default export and named export from TypeScript
const allConfigs = tsConfigModule.default || tsConfigModule;

// Export all environments - sequelize-cli will pick the right one based on NODE_ENV
module.exports = allConfigs;

