import { getCountryFromCode } from '@onefootprint/global-constants';
import {
  CountryCode,
  IdDocSupportedCountryAndDocTypes,
} from '@onefootprint/types';
import identity from 'lodash/identity';

const useCountryOptions = (
  supportedCountryAndDocTypes: IdDocSupportedCountryAndDocTypes,
) => {
  return Object.entries(supportedCountryAndDocTypes)
    .map(([countryCode]) => {
      return getCountryFromCode(countryCode as CountryCode);
    })
    .filter(identity);
};

export default useCountryOptions;
