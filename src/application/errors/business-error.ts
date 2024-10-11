import { ApplicationError } from '@/application/errors/application-error';

export class BusinessError extends ApplicationError {
  name = 'BusinessError';
  constructor(message: string, code?: string) {
    super(message, code);
  }
}
