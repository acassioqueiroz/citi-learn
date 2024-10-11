import { CoreError } from '@/domain/errors/core-error';

export class DomainError extends CoreError {
  name = 'DomainError';
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
  }
}
