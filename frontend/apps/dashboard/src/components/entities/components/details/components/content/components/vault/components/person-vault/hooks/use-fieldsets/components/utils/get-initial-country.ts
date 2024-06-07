import { COUNTRIES, DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import type { CountryCode } from '@onefootprint/types';

const getInitialCountry = (initialCountryCode?: CountryCode) => {
  if (initialCountryCode) {
    const possibleCountry = COUNTRIES.find(country => country.value === initialCountryCode);
    return possibleCountry || DEFAULT_COUNTRY;
  }
  return DEFAULT_COUNTRY;
};

export default getInitialCountry;
