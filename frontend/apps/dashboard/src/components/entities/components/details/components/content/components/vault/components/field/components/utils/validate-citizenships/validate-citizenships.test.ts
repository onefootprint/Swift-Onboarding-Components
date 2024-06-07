import { UsLegalStatus } from '@onefootprint/types';

import EMPTY_SELECT_VALUE from '../../../../../constants';
import validateCitizenships, { CitizenshipsValidationError } from './validate-citizenships';

describe('ValidateCitizenships', () => {
  it('should reject an empty input when the legal status is Green Card or Visa', () => {
    const requiredError = {
      errorType: CitizenshipsValidationError.REQUIRED,
    };
    expect(validateCitizenships('', UsLegalStatus.permanentResident)).toEqual(requiredError);
    expect(validateCitizenships('', UsLegalStatus.visa)).toEqual(requiredError);
  });

  it('should reject any input when the legal status is not Green Card or Visa', () => {
    const shouldBeEmptyError = {
      errorType: CitizenshipsValidationError.SHOULD_BE_EMPTY,
    };
    expect(validateCitizenships('ca, mx', EMPTY_SELECT_VALUE)).toEqual(shouldBeEmptyError);
    expect(validateCitizenships('be, zw, cd', UsLegalStatus.citizen)).toEqual(shouldBeEmptyError);
  });

  it('should reject any inputs that include the US', () => {
    const usError = {
      errorType: CitizenshipsValidationError.US_CITIZENSHIP,
    };
    expect(validateCitizenships('us', UsLegalStatus.permanentResident)).toEqual(usError);
    expect(validateCitizenships('us, ca, mx', UsLegalStatus.visa)).toEqual(usError);
  });

  it('should reject any inputs with invalid countries', () => {
    expect(validateCitizenships('asfd', UsLegalStatus.permanentResident)).toEqual({
      errorType: CitizenshipsValidationError.INVALID,
      data: 'asfd',
    });
    expect(validateCitizenships('asfd, 1234, canada', UsLegalStatus.permanentResident)).toEqual({
      errorType: CitizenshipsValidationError.INVALID,
      data: 'asfd, 1234, canada',
    });
    expect(validateCitizenships('asfd, canada, ca,', UsLegalStatus.visa)).toEqual({
      errorType: CitizenshipsValidationError.INVALID,
      data: 'asfd, canada',
    });
  });

  it('should accept inputs with all valid countries (case insensitive) with the correct legal status', () => {
    expect(validateCitizenships('fr', UsLegalStatus.permanentResident)).toBe(undefined);
    expect(validateCitizenships('fr, zw', UsLegalStatus.visa)).toBe(undefined);
    expect(validateCitizenships('CA, Hk, BE, bG', UsLegalStatus.visa)).toBe(undefined);
  });
});
