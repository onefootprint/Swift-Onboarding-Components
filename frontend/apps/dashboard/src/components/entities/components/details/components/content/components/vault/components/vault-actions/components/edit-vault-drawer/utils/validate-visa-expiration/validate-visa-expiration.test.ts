import { UsLegalStatus } from '@onefootprint/types';

import { EMPTY_SELECT_VALUE } from '../../constants';
import validateVisaExpiration, { VisaExpirationValidationError } from './validate-visa-expiration';

describe('ValidateVisaKind', () => {
  it('should reject an empty input when the legal status is Visa', () => {
    expect(validateVisaExpiration('', UsLegalStatus.visa)).toEqual(VisaExpirationValidationError.REQUIRED);
  });

  it('should reject any input when the legal status is not Visa', () => {
    expect(validateVisaExpiration('2040-11-16', EMPTY_SELECT_VALUE)).toEqual(
      VisaExpirationValidationError.SHOULD_BE_EMPTY,
    );
    expect(validateVisaExpiration('2040-11-16', UsLegalStatus.citizen)).toEqual(
      VisaExpirationValidationError.SHOULD_BE_EMPTY,
    );
    expect(validateVisaExpiration('2022-11-16', UsLegalStatus.permanentResident)).toEqual(
      VisaExpirationValidationError.SHOULD_BE_EMPTY,
    );
  });

  it('should reject an invalid date', () => {
    expect(validateVisaExpiration('as;dfasdkf', UsLegalStatus.visa)).toBe(VisaExpirationValidationError.INVALID);
    expect(validateVisaExpiration('12311111111', UsLegalStatus.visa)).toBe(VisaExpirationValidationError.INVALID);
  });

  it('should reject dates outside of the allowed timeframe (1900-3000)', () => {
    expect(validateVisaExpiration('3100-11-16', UsLegalStatus.visa)).toBe(
      VisaExpirationValidationError.INVALID_TIMEFRAME,
    );
    expect(validateVisaExpiration('3000-11-16', UsLegalStatus.visa)).toBe(
      VisaExpirationValidationError.INVALID_TIMEFRAME,
    );
    expect(validateVisaExpiration('1900-12-20', UsLegalStatus.visa)).toBe(
      VisaExpirationValidationError.INVALID_TIMEFRAME,
    );
    expect(validateVisaExpiration('1800-09-30', UsLegalStatus.visa)).toBe(
      VisaExpirationValidationError.INVALID_TIMEFRAME,
    );
  });

  it('should accept a valid date when the Legal Status is Visa', () => {
    expect(validateVisaExpiration('2030-11-16', UsLegalStatus.visa)).toBe(undefined);
    expect(validateVisaExpiration('2099/02/20', UsLegalStatus.visa)).toBe(undefined);
    expect(validateVisaExpiration('1901-09-30', UsLegalStatus.visa)).toBe(undefined);
  });
});
