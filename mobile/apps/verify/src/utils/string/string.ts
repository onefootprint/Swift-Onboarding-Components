/**
 * Function that returns a USA-date-string representation
 * @param {string} locale en-US, es-MX
 * @param {string} str A date in a string representation such as 12/25/1997 or 25/12/1997
 * @returns {string} A date in a string representation
 * @example
 *     strInputToUSDate('en-US', '12/25/1997') -> '12/25/1997'
 *     strInputToUSDate('es-MX', '25/12/1997') -> '12/25/1997'
 */
export const strInputToUSDate = (locale: string, str: string): string => {
  const now = new Date();
  const part = str.split('/');
  const strFormat = new Intl.DateTimeFormat(locale)
    .formatToParts(now)
    .map((p, i) => (i % 2 === 0 ? p.type : p.value))
    .join('');

  return strFormat === 'day/month/year'
    ? `${part[1].padStart(2, '0')}/${part[0].padStart(2, '0')}/${part[2]}`
    : `${part[0].padStart(2, '0')}/${part[1].padStart(2, '0')}/${part[2]}`;
};

/**
 * Function that takes a string as an argument and returns ISO 8601 format
 * @param {string} date 12/25/1997, 1/1/1997
 * @returns {string} A date in a ISO 8601 format YYYY-MM-DD
 * @example
 *     fromUSDateToISO8601Format('12/25/1997') -> '1997-12-25'
 */
export const fromUSDateToISO8601Format = (date?: string | string[]) => {
  if (!date || Array.isArray(date)) {
    return undefined;
  }
  const [month, day, year] = date.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};
