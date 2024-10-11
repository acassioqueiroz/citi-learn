import { v7 as uuid } from 'uuid';
import { ValidationError } from '@/domain/errors/validation-error';

export class UniqueID {
  constructor(private readonly value: string) {
    const uuidV7regexp = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidV7regexp.test(value)) {
      throw new ValidationError('Invalid format for Unique ID', 'INVALID_UNIQUE_ID');
    }
  }

  static create(): UniqueID {
    const id = uuid();
    const uniqueId = new UniqueID(id);
    return uniqueId;
  }

  getValue() {
    return this.value;
  }
}
