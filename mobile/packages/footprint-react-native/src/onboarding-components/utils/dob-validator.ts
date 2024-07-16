import type { SupportedLocale } from '@onefootprint/types';

const DOB_MIN_AGE = 18;
const DOB_MAX_AGE = 120;

const isValidDate = (date: string) => new Date(date).toString() !== 'Invalid Date';

const isDobTooYoung = (date: string, today = new Date()) => {
  const age = today.getFullYear() - new Date(date).getFullYear();
  return age < DOB_MIN_AGE;
};

const isDobTooOld = (date: string, today = new Date()) => {
  const age = today.getFullYear() - new Date(date).getFullYear();
  return age > DOB_MAX_AGE;
};

const isDobInTheFuture = (date: string, today = new Date()) => new Date(date) >= today;

const getMonthYearDateString = (date: string, locale?: SupportedLocale) => {
  const dayIndex = locale === 'en-US' ? 1 : 0;
  const monthIndex = locale === 'en-US' ? 0 : 1;
  const yearIndex = 2;
  const dateArray = date.split('/');
  if (dateArray.length !== 3 || dayIndex === undefined || monthIndex === undefined || yearIndex === undefined) {
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
    return false;
  }
  return true;
};

const validateDob = (dob: string, locale?: SupportedLocale) => {
  const { day, month, year } = getMonthYearDateString(dob, locale);
  const isCorrectFormat = validateFormat({ day, month, year });
  if (!isCorrectFormat) {
    return 'Invalid date';
  }

  const dobString = `${year}-${month}-${day}`;

  if (!isValidDate(dobString)) {
    return 'Invalid date';
  }
  if (isDobInTheFuture(dobString)) {
    return 'Cannot be in the future';
  }
  if (isDobTooYoung(dobString)) {
    return 'Must be at least 18 years old';
  }
  if (isDobTooOld(dobString)) {
    return 'Cannot be before than 1900';
  }
  return true;
};

export default validateDob;
