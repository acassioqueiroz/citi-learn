import { ValidationError } from '@/domain/errors/validation-error';

export class Domain {
  private readonly value: string;

  constructor(value: string) {
    const regex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    const isValid = regex.test(value);
    if (!isValid) {
      throw new ValidationError('Invalid format for domain', 'INVALID_DOMAIN');
    }
    this.value = value;
  }

  getValue() {
    return this.value;
  }
}
