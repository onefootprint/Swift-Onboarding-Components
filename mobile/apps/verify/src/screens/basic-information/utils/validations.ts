import { differenceInYears, isFuture, isValid } from 'date-fns';

const MIN_VALID_AGE = 18;
const MAX_YEAR_OF_BIRTH = 1900;

export const validateName = (name: string) => {
  const allowedChars = /^([^@#$%^*()_+=~/\\<>~`[\]{}!?;:]+)$/;
  return allowedChars.test(name);
};

export const validateDateFormat = (date: string) => {
  return isValid(new Date(date));
};

export const validateYearOfBirth = (date: string) => new Date(date).getFullYear() >= MAX_YEAR_OF_BIRTH;

export const validateNotFutureDate = (date: string) => !isFuture(new Date(date));

export const validateMinimumAge = (date: string) => {
  const age = differenceInYears(new Date(), new Date(date));
  return age >= MIN_VALID_AGE;
};
