import formatISO from 'date-fns/formatISO';
import isValid from 'date-fns/isValid';
import parse from 'date-fns/parse';
import parseISO from 'date-fns/parseISO';

export const isValidIsoDate = (dateStr: string): boolean => {
  try {
    return isValid(parseISO(dateStr));
  } catch (_) {
    return false;
  }
};

export const getIsoDate = (dateStr: string, locale: 'es-MX' | 'en-US'): string | undefined => {
  if (!dateStr || typeof dateStr !== 'string') return undefined;
  if (isValidIsoDate(dateStr)) return dateStr;

  const strFormat = locale === 'es-MX' ? 'dd/MM/yyyy' : 'MM/dd/yyyy';
  const date = parse(dateStr, strFormat, new Date());

  try {
    return formatISO(new Date(date.getFullYear(), date.getMonth(), date.getDate()), { representation: 'date' });
  } catch (_) {
    return undefined;
  }
};
