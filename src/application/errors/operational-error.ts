import { UnexpectedError } from '@/cross-cutting/errors/unexpected-error';

export class OperationalError extends UnexpectedError {
  name = 'OperationalError';
  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}
