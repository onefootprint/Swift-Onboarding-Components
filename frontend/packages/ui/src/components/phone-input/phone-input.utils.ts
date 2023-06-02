import { COUNTRIES, DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import { PhoneNumberUtil } from 'google-libphonenumber';

const phoneNumberUtil = PhoneNumberUtil.getInstance();

export const detectCountry = (value = '') => {
  if (!value) return DEFAULT_COUNTRY;
  try {
    const number = phoneNumberUtil.parseAndKeepRawInput(value);
    const countryCode = phoneNumberUtil.getRegionCodeForNumber(number);
    const possibleCountry = COUNTRIES.find(
      country => country.value === countryCode,
    );
    return possibleCountry || DEFAULT_COUNTRY;
  } catch (_) {
    return DEFAULT_COUNTRY;
  }
};

export const getNationalNumber = (prefix: string, value = '') => {
  if (!value) return value;
  return value.replace(prefix, '');
};
