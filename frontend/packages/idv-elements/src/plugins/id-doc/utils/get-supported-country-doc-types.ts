import type { CountryCode, SupportedIdDocTypes } from '@onefootprint/types';

const getSupportedCountryDocTypes = (countryAndDocTypes: {
  [x: string]: SupportedIdDocTypes[];
}) => {
  const supportedCountryAndDocTypes: Partial<
    Record<CountryCode, SupportedIdDocTypes[]>
  > = {};
  const supportedCountries = Object.keys(countryAndDocTypes).map(
    country => country.toUpperCase() as CountryCode,
  );
  supportedCountries.forEach(country => {
    supportedCountryAndDocTypes[country] =
      countryAndDocTypes[country.toLowerCase()];
  });
  return supportedCountryAndDocTypes;
};

export default getSupportedCountryDocTypes;
