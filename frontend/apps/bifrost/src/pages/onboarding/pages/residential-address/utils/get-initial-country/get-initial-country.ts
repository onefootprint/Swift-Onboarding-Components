import { COUNTRIES, DEFAULT_COUNTRY } from 'global-constants';
import type { CountryCode } from 'types';

export const getInitialCountry = (initialCountryCode?: CountryCode) => {
  if (initialCountryCode) {
    const possibleCountry = COUNTRIES.find(
      country => country.value === initialCountryCode,
    );
    return possibleCountry || possibleCountry;
  }
  return DEFAULT_COUNTRY;
};

export default getInitialCountry;
