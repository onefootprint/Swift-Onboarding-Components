import { US_TERRITORY_COUNTRY_CODES } from '@onefootprint/global-constants';
import { IdDI } from '@onefootprint/types';

import type { KycData } from '../../../data-types';

const isCountryUsOrTerritories = (data: KycData) => {
  if (!data[IdDI.country]) {
    return true;
  }
  const { value } = data[IdDI.country];
  return !value || value === 'US' || US_TERRITORY_COUNTRY_CODES.includes(value);
};

export default isCountryUsOrTerritories;
