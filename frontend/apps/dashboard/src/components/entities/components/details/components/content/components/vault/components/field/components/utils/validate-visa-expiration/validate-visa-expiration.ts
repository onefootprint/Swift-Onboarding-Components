import { UsLegalStatus } from '@onefootprint/types';
import { isValid } from 'date-fns';

export enum VisaExpirationValidationError {
  SHOULD_BE_EMPTY,
  REQUIRED,
  INVALID,
  INVALID_TIMEFRAME,
}

const validateVisaKind = (visaExpiration: string, legalStatus: string): VisaExpirationValidationError | undefined => {
  const empty = !visaExpiration;
  const shouldBeEmpty = legalStatus !== UsLegalStatus.visa;
  if (shouldBeEmpty && empty) {
    return undefined;
  }
  if (!shouldBeEmpty && empty) {
    return VisaExpirationValidationError.REQUIRED;
  }
  if (shouldBeEmpty && !empty) {
    return VisaExpirationValidationError.SHOULD_BE_EMPTY;
  }
  if (!isValid(new Date(visaExpiration))) {
    return VisaExpirationValidationError.INVALID;
  }
  if (new Date(visaExpiration).getFullYear() <= 1900 || new Date(visaExpiration).getFullYear() >= 3000) {
    return VisaExpirationValidationError.INVALID_TIMEFRAME;
  }
  return undefined;
};

export default validateVisaKind;
