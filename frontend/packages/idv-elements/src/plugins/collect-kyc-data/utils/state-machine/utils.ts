import { IdDI } from '@onefootprint/types';

import { KycData } from '../data-types';

const isInDomesticFlow = (data: KycData) =>
  !data[IdDI.country] || data[IdDI.country].value === 'US';

export default isInDomesticFlow;
