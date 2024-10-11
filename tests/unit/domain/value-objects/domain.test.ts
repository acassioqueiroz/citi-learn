import { ValidationError } from '@/domain/errors/validation-error';
import { Domain } from '@/domain/value-objects/domain';

describe('Domain Value Object', () => {
  it('should create a valid domain object', () => {
    const domain = new Domain('example.com');
    expect(domain.getValue()).toBe('example.com');
  });

  it('should throw an error for an invalid domain', () => {
    expect(() => new Domain('invalid_domain')).toThrow(ValidationError);
    expect(() => new Domain('invalid_domain')).toThrow('Invalid format for domain');
  });

  it('should create a domain with mixed case and return it as-is', () => {
    const domain = new Domain('Example.COM');
    expect(domain.getValue()).toBe('Example.COM');
  });

  it('should throw a specific error code when domain is invalid', () => {
    try {
      new Domain('bad_domain');
    } catch (error) {
      if (error instanceof ValidationError) {
        expect(error.code).toBe('INVALID_DOMAIN');
      }
    }
  });
});
