import { CoreError } from '@/domain/errors/core-error';

export class ApplicationError extends CoreError {
  name = 'ApplicationError';
  constructor(
    message: string,
    private readonly code?: string,
  ) {
    super(message);
  }
}
