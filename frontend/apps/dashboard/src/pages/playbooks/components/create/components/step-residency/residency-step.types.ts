import type { CountryRecord } from '@onefootprint/global-constants';

export type ResidencyFormData = {
  allowUsTerritories: boolean;
  countryList: CountryRecord[];
  isCountryRestricted: false;
  residencyType: 'us' | 'international';
};
