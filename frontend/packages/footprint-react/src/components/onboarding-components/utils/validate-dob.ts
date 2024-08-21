import { isDobInTheFuture, isDobTooOld, isDobTooYoung, isValidDate } from '@onefootprint/core';
import type { SupportedLocale } from '@onefootprint/types';
import type { CleaveOptions } from 'cleave.js/options';

const validateDob = (dob: string, locale?: SupportedLocale) => {
  const mask = {
    date: true,
    datePattern: locale === 'en-US' ? ['m', 'd', 'Y'] : ['d', 'm', 'Y'],
    delimiter: '/',
    numericOnly: true,
  };
  const { day, month, year } = getMonthYearDateString(dob, mask);
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

const getMonthYearDateString = (date: string, dobMask: CleaveOptions) => {
  const pattern = dobMask.datePattern;
  const dayIndex = pattern?.indexOf('d');
  const monthIndex = pattern?.indexOf('m');
  const yearIndex = pattern?.indexOf('Y');
  const dateArray = date.split(dobMask.delimiter ?? '/');
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

export default validateDob;
