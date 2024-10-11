import { ValidationError } from '@/domain/errors/validation-error';
import { UniqueID } from '@/domain/value-objects/unique-id';

it('should create a incremental UUID object', () => {
  const uuid1 = UniqueID.create();
  const uuid2 = UniqueID.create();
  const uuid3 = UniqueID.create();
  const uuid4 = UniqueID.create();

  expect(uuid1.getValue().localeCompare(uuid2.getValue())).toBeLessThan(0);
  expect(uuid2.getValue().localeCompare(uuid3.getValue())).toBeLessThan(0);
  expect(uuid3.getValue().localeCompare(uuid4.getValue())).toBeLessThan(0);
});

it('shoud not create an invalid UUID object', () => {
  expect(() => new UniqueID('invalid_uuid')).toThrow();
  expect(() => new UniqueID('invalid_uuid')).toThrow(ValidationError);
  expect(() => new UniqueID('invalid_uuid')).toThrow('Invalid format for Unique ID');
});
