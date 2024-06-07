import type { Mask } from '@onefootprint/hooks/src/use-input-mask';
import { isFuture, isValid } from 'date-fns';

export const MIN_VALID_AGE = 18;

export enum DobValidationError {
  INVALID,
  FUTURE_DATE,
  TOO_YOUNG,
  TOO_OLD,
  INCORRECT_FORMAT,
}

const validateDob = (dob: string, inputMasks: Mask): DobValidationError | undefined => {
  const { day, month, year } = getMonthYearDateString(dob, inputMasks);
  const formatError = validateFormat({ day, month, year });
  if (formatError) {
    return formatError;
  }

  const dobDate = new Date(`${year}-${month}-${day}`);

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

const getMonthYearDateString = (date: string, inputMasks: Mask) => {
  if (!inputMasks) return { day: '', month: '', year: '' };
  const dobMask = inputMasks.dob;
  const pattern = dobMask.datePattern;
  const dayIndex = pattern.indexOf('d');
  const monthIndex = pattern.indexOf('m');
  const yearIndex = pattern.indexOf('Y');
  const dateArray = date.split(dobMask.delimiter);
  if (dateArray.length !== 3) {
    return { day: '', month: '', year: '' };
  }
  const day = dateArray[dayIndex];
  const month = dateArray[monthIndex];
  const year = dateArray[yearIndex];
  return {
    day,
    month,
    year,
  };
};

const validateFormat = ({
  day,
  month,
  year,
}: {
  day: string;
  month: string;
  year: string;
}) => {
  if (day.length !== 2 || month.length !== 2 || year.length !== 4) {
    return DobValidationError.INCORRECT_FORMAT;
  }
  return undefined;
};

export default validateDob;
