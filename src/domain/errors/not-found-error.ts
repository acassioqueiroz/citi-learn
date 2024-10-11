import { DomainError } from './domain-error';

export class NotFoundError extends DomainError {
  name = 'NotFoundError';
  constructor(message: string, code?: string) {
    super(message, code);
  }
}
