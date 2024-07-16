import type { SupportedLocale, VaultValue } from '@onefootprint/types';

import type { FormValues } from '../../types';
import { fromUSDateToISO8601Format, strInputToUSDate } from './date-formatter';

export const removeEmpty = (
  obj: Partial<Record<keyof FormValues, VaultValue>>,
): Partial<Record<keyof FormValues, VaultValue>> => {
  return Object.fromEntries(Object.entries(obj).filter(e => !!e[1]));
};

export const formatBeforeSave = (data: Partial<Record<keyof FormValues, VaultValue>>, locale: SupportedLocale) => {
  if (typeof data['id.dob'] === 'string') {
    const usDobString = strInputToUSDate(locale, data['id.dob']);
    data['id.dob'] = fromUSDateToISO8601Format(usDobString);
  }
  return removeEmpty(data);
};
