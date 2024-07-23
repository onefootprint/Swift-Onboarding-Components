import type { SupportedLocale } from '@onefootprint/footprint-js';
import type { CountryRecord } from '@onefootprint/global-constants';
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

export const getCountryCodeFromLocale = (l?: SupportedLocale) =>
  l ? (l.slice(-2).toUpperCase() as CountryCode) : undefined;

export const getDefaultCountry = (supportedCountries: Set<CountryCode>, supportedCountryRecords: CountryRecord[]) => {
  let defaultCountry;
  if (supportedCountries.has('US')) {
    defaultCountry = getCountryFromCode('US');
  }

  if (!defaultCountry) [defaultCountry] = supportedCountryRecords;
  return defaultCountry;
};
