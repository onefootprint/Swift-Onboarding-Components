import type { SupportedLocale } from '@onefootprint/types';

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

/// Converts a US date string to a date string based on the locale.
///
/// [locale] should be a locale string like 'en_US' or 'es_MX'.
/// [str] is a date string in the format '12/25/1997' or '25/12/1997'.
///
/// Returns a date string in the locale format 'MM/DD/YYYY' or 'DD/MM/YYYY'.
export const fromUsDateToStringInput = (locale: SupportedLocale, str: string): string => {
  if (!str || str.trim().length === 0 || !locale) return '';

  const parts = str.trim().split('/');

  const day = parts.length > 1 ? parts[1].padStart(2, '0') : '';
  const month = parts.length > 0 ? parts[0].padStart(2, '0') : '';
  const year = parts.length > 2 ? parts[2] : '';

  if (!day || !month || !year) return '';

  return locale === 'en-US' ? `${month}/${day}/${year}` : `${day}/${month}/${year}`;
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

/// Converts an ISO 8601 date string to US date format.
///
/// [date] is a date string in the format 'YYYY-MM-DD'.
///
/// Returns a date string in US format 'MM/DD/YYYY' or null if the input is invalid.
export const fromISO8601ToUSDate = (date: string | null): string | null => {
  if (date === null || typeof date !== 'string' || date.trim().length === 0) return null;

  const parts = date.trim().split('-');
  if (parts.length !== 3) return null;

  const year = parts[0].trim();
  const month = parts[1].trim();
  const day = parts[2].trim();

  return day && month && year ? `${month}/${day}/${year}` : null;
};
