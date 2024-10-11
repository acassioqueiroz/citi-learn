import { Logger } from '@/cross-cutting/logging/logger';
import winston from 'winston';
import { loggerConfig } from '@/drivers/configs/logger';

export type LogLevel = 'info' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export class WinstonLogger implements Logger {
  private logger: winston.Logger;

  constructor() {
    const level = loggerConfig.level;
    this.logger = winston.createLogger({
      level: level === 'trace' ? 'silly' : level,
      format: winston.format.combine(winston.format.timestamp(), winston.format.cli()),
      transports: [new winston.transports.Console()],
    });
  }

  log(message: string): void {
    this.logger.info(message);
  }

  error(message: string): void {
    this.logger.error(message);
  }

  warn(message: string): void {
    this.logger.warn(message);
  }

  info(message: string): void {
    this.logger.info(message);
  }

  debug(message: string): void {
    this.logger.debug(message);
  }

  trace(message: string): void {
    this.logger.silly(message);
  }
}
