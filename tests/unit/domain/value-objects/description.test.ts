import { Description } from '@/domain/value-objects/description';
import { ValidationError } from '@/domain/errors/validation-error';

describe('Description', () => {
  it('should create a description when a valid value is provided', () => {
    const validValue = 'This is a valid description';
    const description = new Description(validValue);
    expect(description.getValue()).toBe(validValue);
  });

  it('should throw ValidationError when no value is provided', () => {
    expect(() => {
      new Description('');
    }).toThrow(ValidationError);

    try {
      new Description('');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).message).toBe('Description is required');
      expect((error as ValidationError).code).toBe('INVALID_DESCRIPTION');
    }
  });
});
