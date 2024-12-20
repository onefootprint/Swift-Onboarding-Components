import type { InsightAddress } from '@onefootprint/request-types/dashboard';
import type { FormattedAddress } from '../../../../onboarding-business-insight.types';

const formatAddress = (address: InsightAddress, id: string): FormattedAddress => ({
  id,
  ...address,
});

export default formatAddress;
