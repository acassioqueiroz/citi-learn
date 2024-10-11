import { CoreError } from '@/domain/errors/core-error';

export class AdapterError extends CoreError {
  name = 'AdapterError';
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    if (cause instanceof Error) {
      this.stack = `${this.stack}\n${cause.stack}`;
    }
  }
}
