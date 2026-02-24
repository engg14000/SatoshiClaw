import winston from 'winston';

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'agent.log' })
  ]
});

// Meme wrapper for logs
export const memeLog = (message: string) => {
    logger.info(`🦞 ${message} 🦞`);
};
