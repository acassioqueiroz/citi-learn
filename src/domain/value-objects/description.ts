import { ValidationError } from '@/domain/errors/validation-error';

export class Description {
  private readonly value: string;

  constructor(value: string) {
    if (!value) {
      throw new ValidationError('Description is required', 'INVALID_DESCRIPTION');
    }
    this.value = value;
  }

  getValue() {
    return this.value;
  }
}
