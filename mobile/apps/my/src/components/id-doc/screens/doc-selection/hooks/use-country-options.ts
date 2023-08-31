import { COUNTRIES, getCountryFromCode } from '@onefootprint/global-constants';
import { CountryCode } from '@onefootprint/types';
import identity from 'lodash/identity';

const useCountryOptions = (supportedCountries: CountryCode[]) => {
  if (supportedCountries.length) {
    return supportedCountries
      .map(countryCode => getCountryFromCode(countryCode))
      .filter(identity);
  }
  return COUNTRIES;
};

export default useCountryOptions;
