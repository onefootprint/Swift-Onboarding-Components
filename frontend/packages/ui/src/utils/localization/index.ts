import type { CountryCode, SupportedLocale } from '@onefootprint/types';

// eslint-disable-next-line import/prefer-default-export
export const getCountryCodeFromLocale = (l?: SupportedLocale) =>
  l ? (l.slice(-2).toUpperCase() as CountryCode) : undefined;
