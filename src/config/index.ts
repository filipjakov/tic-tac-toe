import dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

const envFound = dotenv.config();

if (!envFound) {
  // Crash the whole process
  throw new Error('Cannot find .env file');
}

export default {
  port: parseInt(process.env.PORT as string, 10),
  prod: process.env.NODE_ENV === "prod",
  dev: process.env.NODE_ENV === "dev",
  logs: {
    level: process.env.LOG_LEVEL || 'console'
  },
  jwtSecret: process.env.JWT_SECRET as string
}
