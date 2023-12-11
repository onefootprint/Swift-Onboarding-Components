import { IdDI } from '@onefootprint/types';

import type { KycData } from '@/types';

const US_TERRITORY_COUNTRY_CODES = ['AS', 'GU', 'MP', 'PR', 'VI'];

const isCountryUsOrTerritories = (data: KycData) => {
  if (!data[IdDI.country]) {
    return true;
  }
  const { value } = data[IdDI.country];
  return !value || value === 'US' || US_TERRITORY_COUNTRY_CODES.includes(value);
};

export default isCountryUsOrTerritories;
