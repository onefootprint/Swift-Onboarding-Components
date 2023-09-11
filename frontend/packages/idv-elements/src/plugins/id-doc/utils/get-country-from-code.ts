import { COUNTRIES } from '@onefootprint/global-constants';
import type { CountryCode, CountryCode3 } from '@onefootprint/types';

export const getCountryFromCode = (countryCode?: CountryCode) => {
  const match = COUNTRIES.find(country => country.value === countryCode);
  return match;
};

export const getCountryFromCode3 = (countryCode?: CountryCode3) => {
  const match = COUNTRIES.find(country => country.value3 === countryCode);
  return match;
};
