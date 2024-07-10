import type { SupportedLocale, VaultValue } from '@onefootprint/types';

import type { Di } from '../types/dis';
import { fromUSDateToISO8601Format, strInputToUSDate } from './date-formatter';

export const removeEmpty = (
  obj: Partial<Record<keyof Di, VaultValue>>,
): Partial<Record<keyof Di, VaultValue>> => {
  return Object.fromEntries(Object.entries(obj).filter(e => !!e[1]));
};

export const formatBeforeSave = (
  data: Partial<Record<keyof Di, VaultValue>>,
  locale: SupportedLocale,
) => {
  if (typeof data['id.dob'] === 'string') {
    const usDobString = strInputToUSDate(locale, data['id.dob']);
    // eslint-disable-next-line no-param-reassign
    data['id.dob'] = fromUSDateToISO8601Format(usDobString);
  }
  return removeEmpty(data);
};
