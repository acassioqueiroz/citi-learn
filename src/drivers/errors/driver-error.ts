import { CoreError } from '@/domain/errors/core-error';

export class DriverError extends CoreError {
  constructor(message: string, cause?: unknown) {
    super(message);
    if (cause instanceof Error) {
      this.stack = `${this.stack}\n${cause.stack}`;
    }
  }
}
