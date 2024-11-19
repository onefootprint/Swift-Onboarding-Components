import type { Iso3166TwoDigitCountryCode } from '@onefootprint/request-types/dashboard';

export type ResidencyFormData = {
  allowUsTerritories: boolean;
  countryList: Iso3166TwoDigitCountryCode[];
  isCountryRestricted: boolean;
  residencyType: 'us' | 'international';
};
