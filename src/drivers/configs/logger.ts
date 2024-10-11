import { LogLevel } from '@/cross-cutting/logging/winston-logger';

interface LoggerConfig {
  level: LogLevel;
}

const loggerConfig: LoggerConfig = {
  level: 'trace',
};

export { loggerConfig };