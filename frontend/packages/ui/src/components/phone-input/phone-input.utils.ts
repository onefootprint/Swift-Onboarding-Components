import { COUNTRIES, DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import type { CountryCode } from '@onefootprint/types';
import { PhoneNumberUtil } from 'google-libphonenumber';

const phoneNumberUtil = PhoneNumberUtil.getInstance();

export const getCountryFromPhoneNumber = (phone = '', code?: CountryCode) => {
  if (!phone && !code) return DEFAULT_COUNTRY;
  try {
    if (code) {
      return COUNTRIES.find(c => c.value === code) || DEFAULT_COUNTRY;
    }

    const number = phoneNumberUtil.parseAndKeepRawInput(phone);
    const countryCode = phoneNumberUtil.getRegionCodeForNumber(number);
    return COUNTRIES.find(c => c.value === countryCode) || DEFAULT_COUNTRY;
  } catch (_) {
    return DEFAULT_COUNTRY;
  }
};

export const getNationalNumber = (prefix: string, value = '') => {
  if (!value) return value;
  return value.replace(prefix, '');
};
