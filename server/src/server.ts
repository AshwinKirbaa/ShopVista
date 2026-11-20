import app from './app';
import { config } from './config';
import { prisma } from './config/prisma';

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Connected to PostgreSQL successfully');

    app.listen(config.port, () => {
      console.log(`E-Commerce Backend running on port ${config.port} [${config.nodeEnv}]`);
      console.log(`API base URL: http://localhost:${config.port}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
