import { COUNTRIES, DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import type { CountryCode } from '@onefootprint/types';

const getInitialCountry = (initialCountryCode?: CountryCode, ignoreDefaultCountry: boolean = false) => {
  if (initialCountryCode) {
    const possibleCountry = COUNTRIES.find(country => country.value === initialCountryCode);
    return ignoreDefaultCountry ? possibleCountry : possibleCountry || DEFAULT_COUNTRY;
  }
  return ignoreDefaultCountry ? undefined : DEFAULT_COUNTRY;
};

export default getInitialCountry;
