import { Title } from '@/domain/value-objects/title';
import { ValidationError } from '@/domain/errors/validation-error';

describe('Title', () => {
  it('should create a title when a valid value is provided', () => {
    const validValue = 'This is a valid title';
    const title = new Title(validValue);
    expect(title.getValue()).toBe(validValue);
  });

  it('should throw ValidationError when no value is provided', () => {
    expect(() => {
      new Title('');
    }).toThrow(ValidationError);

    try {
      new Title('');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).message).toBe('Title is required');
      expect((error as ValidationError).code).toBe('INVALID_TITLE');
    }
  });
});
