import { IdDI } from '@onefootprint/types';

import type { KycData } from '../../../data-types';

const isCountryUs = (data: KycData) =>
  !data[IdDI.country] || data[IdDI.country].value === 'US';

export default isCountryUs;
