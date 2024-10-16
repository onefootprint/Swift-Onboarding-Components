import type { SupportedLocale } from '@onefootprint/footprint-js';
import type { CountryRecord } from '@onefootprint/global-constants';
import { COUNTRIES, DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import type { CountryCode } from '@onefootprint/types';

export const getCountryFromCode = (countryCode?: CountryCode) => {
  const match = COUNTRIES.find(country => country.value === countryCode);
  return match;
};

export const getCountryCodeFromLocale = (l?: SupportedLocale) =>
  l ? (l.slice(-2).toUpperCase() as CountryCode) : undefined;

export const getDefaultCountry = (supportedCountries: Set<CountryCode>, countryCode?: CountryCode): CountryRecord => {
  let country;

  if (countryCode && supportedCountries.has(countryCode)) {
    country = getCountryFromCode(countryCode);
  } else if (supportedCountries.has('US')) {
    country = getCountryFromCode('US');
  } else if (supportedCountries.size > 0) {
    country = getCountryFromCode(Array.from(supportedCountries)[0]);
  }

  return country || DEFAULT_COUNTRY;
};
