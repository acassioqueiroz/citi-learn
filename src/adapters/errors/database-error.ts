import { AdapterError } from '@/adapters/errors/adapter-error';

export class DatabaseError extends AdapterError {
  name = 'DatabaseError';

  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}
