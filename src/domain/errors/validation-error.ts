import { DomainError } from './domain-error';

export class ValidationError extends DomainError {
  name = 'ValidationError';
  constructor(message: string, code?: string) {
    super(message, code);
  }
}
