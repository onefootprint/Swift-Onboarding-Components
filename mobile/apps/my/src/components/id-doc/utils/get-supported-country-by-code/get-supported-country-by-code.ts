import type { CountryCode, IdDocSupportedCountryAndDocTypes, SupportedIdDocTypes } from '@onefootprint/types';

const getSupportedCountryByCode = (
  supportedCountryAndDocTypes: IdDocSupportedCountryAndDocTypes,
  countryCode: CountryCode,
): SupportedIdDocTypes[] => {
  return supportedCountryAndDocTypes[countryCode] || supportedCountryAndDocTypes[countryCode.toLowerCase()];
};

export default getSupportedCountryByCode;
