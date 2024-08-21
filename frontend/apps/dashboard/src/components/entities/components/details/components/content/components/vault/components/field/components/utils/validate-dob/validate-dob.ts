import { isFuture, isValid } from 'date-fns';

export const MIN_VALID_AGE = 18;

export enum DobValidationError {
  INVALID = 0,
  FUTURE_DATE = 1,
  TOO_YOUNG = 2,
  TOO_OLD = 3,
}

const validateDob = (dob: string): DobValidationError | undefined => {
  const dobDate = new Date(dob);

  if (!isValid(dobDate)) {
    return DobValidationError.INVALID;
  }

  if (dobDate.getFullYear() < 1900) {
    return DobValidationError.TOO_OLD;
  }

  if (isFuture(dobDate)) {
    return DobValidationError.FUTURE_DATE;
  }

  // Cannot be younger than MIN_VALID_AGE
  const dobTime = dobDate.getTime();
  const currentTime = new Date().getTime();
  const daysOnEarth = (currentTime - dobTime) / (1000 * 3600 * 24);
  const age = daysOnEarth / 365;
  if (age < MIN_VALID_AGE) {
    return DobValidationError.TOO_YOUNG;
  }

  return undefined;
};

export default validateDob;
