import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();

if (!envFound) {
  // Crash the whole process
  throw new Error('Cannot find .env file');
}

export default {
  port: parseInt(process.env.PORT as string, 10),
  prod: process.env.NODE_ENV === 'production',
  dev: process.env.NODE_ENV === 'development',
  logs: {
    level: process.env.LOG_LEVEL || 'silly'
  },
  jwtSecret: process.env.JWT_SECRET as string
}
