import { IdDI } from '@onefootprint/types';

import type { KycData } from '@/types';

const isInDomesticFlow = (data: KycData) =>
  !data[IdDI.country] || data[IdDI.country].value === 'US';

export default isInDomesticFlow;
