import type { SupportedLocale } from '@onefootprint/footprint-js';
import type { CountryCode } from '@onefootprint/types';

// eslint-disable-next-line import/prefer-default-export
export const getCountryCodeFromLocale = (l?: SupportedLocale) =>
  l ? (l.slice(-2).toUpperCase() as CountryCode) : undefined;
