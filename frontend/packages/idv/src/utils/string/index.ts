/* eslint-disable import/prefer-default-export */
import type { SupportedLocale } from '@onefootprint/footprint-js';

const isString = (x: unknown): x is string => typeof x === 'string';

/**
 * Function that returns a USA-date-string representation
 * @param {string} locale en-US, es-MX
 * @param {string} str A date in a string representation such as 12/25/1997 or 25/12/1997
 * @returns {string} A date in a string representation
 * @example
 *     strInputToUSDate('en-US', '12/25/1997') -> '12/25/1997'
 *     strInputToUSDate('es-MX', '25/12/1997') -> '12/25/1997'
 *     strInputToUSDate('en-US', falsy) -> ''
 */
export const strInputToUSDate = (locale: SupportedLocale, str: string): string => {
  if (!str || !isString(str) || !locale) return '';

  const now = new Date();
  const part = str.trim().split('/');
  const strFormat = new Intl.DateTimeFormat(locale)
    .formatToParts(now)
    .map((p, i) => (i % 2 === 0 ? p.type : p.value))
    .join('');

  const day = part[0] ? part[0].padStart(2, '0') : '';
  const month = part[1] ? part[1].padStart(2, '0') : '';
  const year = part[2] ? part[2] : '';

  if (!day || !month || !year) return '';

  return strFormat === 'day/month/year' ? `${month}/${day}/${year}` : `${day}/${month}/${year}`;
};

/**
 * Function that takes a string as an argument and returns ISO 8601 format
 * @param {string} date 12/25/1997, 1/1/1997
 * @returns {string} A date in a ISO 8601 format YYYY-MM-DD
 * @example
 *     fromUSDateToISO8601Format('12/25/1997') -> '1997-12-25'
 *     fromUSDateToISO8601Format(falsy) -> undefined
 */
export const fromUSDateToISO8601Format = (date?: string | string[]): string | undefined => {
  if (!date || !isString(date) || Array.isArray(date)) return undefined;

  const [month, day, year] = date.trim().split('/');
  return !day || !month || !year ? undefined : `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

export const isISO8601Format = (str: string): boolean => /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(str);
