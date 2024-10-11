import { CrossCuttingError } from '@/cross-cutting/errors/cross-cutting-error';

export class UnexpectedError extends CrossCuttingError {
  name = 'UnexpectedError';
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    if (cause instanceof Error) {
      this.stack = `${this.stack}\n${cause.stack}`;
    }
  }
}
