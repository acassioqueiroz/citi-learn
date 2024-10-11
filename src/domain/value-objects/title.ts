import { ValidationError } from '@/domain/errors/validation-error';

export class Title {
  private readonly value: string;

  constructor(value: string) {
    if (!value) {
      throw new ValidationError('Title is required', 'INVALID_TITLE');
    }
    this.value = value;
  }

  getValue() {
    return this.value;
  }
}
