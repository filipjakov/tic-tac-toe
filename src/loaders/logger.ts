import winston from 'winston';
import config from '../config';

const transport = config.prod ?
  new winston.transports.Console() :
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.cli(),
      winston.format.splat(),
    )
  });


const Logger = winston.createLogger({
  level: config.logs.level,
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [transport]
});

export default Logger;
