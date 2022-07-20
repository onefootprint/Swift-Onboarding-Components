import { COUNTRIES, DEFAULT_COUNTRY, REGION_CODES } from 'global-constants';
import { PhoneNumberUtil } from 'google-libphonenumber';

const phoneUtils = PhoneNumberUtil.getInstance();

export const getNumberByCountryValue = (countryValue: string) => {
  if (!countryValue) {
    return '';
  }
  const country = COUNTRIES.find(
    ({ value }) =>
      value.toLocaleLowerCase() === countryValue.toLocaleLowerCase(),
  );
  return country ? REGION_CODES[country.value] : '';
};

export const getCountryByNumber = (phone?: string) => {
  if (!phone) {
    return DEFAULT_COUNTRY;
  }
  const countryCode = getPossibleCountryCode(phone);
  if (!countryCode) {
    return DEFAULT_COUNTRY;
  }
  const country = COUNTRIES.find(({ value }) => value === countryCode);
  return country || DEFAULT_COUNTRY;
};

export const getPossibleCountryCode = (phone: string) => {
  const phoneNumber = phoneUtils.parseAndKeepRawInput(phone);
  return phoneUtils.getRegionCodeForNumber(phoneNumber);
};
