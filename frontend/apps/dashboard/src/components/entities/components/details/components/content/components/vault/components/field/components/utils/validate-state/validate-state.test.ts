import EMPTY_SELECT_VALUE from '../../../../../constants';
import validateState, { StateValidationError } from './validate-state';

describe('ValidateState', () => {
  it('should reject any state when the country is not the US', () => {
    expect(validateState('AL', false)).toBe(
      StateValidationError.SHOULD_BE_EMPTY,
    );
    expect(validateState('FL', false)).toBe(
      StateValidationError.SHOULD_BE_EMPTY,
    );
  });

  it('should reject an empty State when the country is the US', () => {
    expect(validateState(EMPTY_SELECT_VALUE, true)).toBe(
      StateValidationError.REQUIRED,
    );
  });

  it('should accept an empty State when the country is not the US', () => {
    expect(validateState(EMPTY_SELECT_VALUE, false)).toBe(undefined);
  });

  it('should accept a valid State when the country is the US', () => {
    expect(validateState('TX', true)).toBe(undefined);
    expect(validateState('NY', true)).toBe(undefined);
  });
});
